import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const configFile = new URL('../../svelte.config.js', import.meta.url).href;
const helperFile = new URL('../../scripts/isolated-kit-env.js', import.meta.url).href;
const validationFile = new URL('../../node_modules/@sveltejs/kit/src/core/config/index.js', import.meta.url).href;
const loaderFile = new URL('../../node_modules/@sveltejs/kit/src/exports/vite/utils.js', import.meta.url).href;
const { default: config } = await import(configFile);
const { isolatedKitEnvDirectory } = await import(helperFile) as { isolatedKitEnvDirectory: (directory: string) => string };
const { validate_config } = await import(validationFile);
const { get_env } = await import(loaderFile);

test('Kit excludes ambient base/mode/local dotenv while retaining explicit process values', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'u1-kit-env-test-'));
  const processKeys = ['U1_TEST_EXPLICIT_ENV', 'PUBLIC_U1_TEST_EXPLICIT_ENV'];
  const previous = processKeys.map((key) => process.env[key]);
  const ambientKeys: string[] = [];
  try {
    for (const [index, file] of ['.env', '.env.local', '.env.production', '.env.production.local'].entries()) {
      const keys = [`U1_TEST_AMBIENT_${index}`, `PUBLIC_U1_TEST_AMBIENT_${index}`];
      ambientKeys.push(...keys);
      writeFileSync(path.join(root, file), keys.map((key) => `${key}=synthetic_dotenv_${index}`).join('\n'));
    }
    for (const key of processKeys) process.env[key] = 'synthetic_explicit_value';
    const validated = validate_config(config, root);
    // Positive control: the same installed loader can read this synthetic
    // fixture when explicitly pointed at it. No real .env is ever opened.
    const control = get_env({ ...validated.kit.env, dir: root }, 'production');
    const isolated = get_env(validated.kit.env, 'production');
    for (const key of ambientKeys) {
      expect(control.all[key]).toMatch(/^synthetic_dotenv_/);
      expect(isolated.all[key]).toBeUndefined();
    }
    expect(isolated.private[processKeys[0]]).toBe('synthetic_explicit_value');
    expect(isolated.public[processKeys[1]]).toBe('synthetic_explicit_value');
  } finally {
    processKeys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
    rmSync(root, { recursive: true, force: true });
  }
});

for (const entry of ['.env', '.env.production']) {
  test(`the controlled directory rejects ${entry} before the loader can read it`, () => {
    const root = mkdtempSync(path.join(tmpdir(), 'u1-kit-env-test-'));
    try {
      writeFileSync(path.join(root, '.gitkeep'), '');
      expect(isolatedKitEnvDirectory(root)).toBe(root);
      writeFileSync(path.join(root, entry), 'PUBLIC_U1_TEST_UNWANTED=synthetic');
      expect(() => isolatedKitEnvDirectory(root)).toThrow('must contain only .gitkeep');
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
}

test('the controlled environment directory cannot be redirected through a symlink', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'u1-kit-env-test-'));
  try {
    mkdirSync(path.join(root, 'target'));
    symlinkSync(path.join(root, 'target'), path.join(root, 'link'));
    expect(() => isolatedKitEnvDirectory(path.join(root, 'link'))).toThrow('must contain only .gitkeep');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('real nested package build commands do not re-enable Bun dotenv loading', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'u1-kit-env-test-'));
  const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  try {
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: packageJson.scripts }));
    writeFileSync(path.join(root, '.env'), 'U1_TEST_NESTED_DOTENV=synthetic_ambient\nPUBLIC_U1_TEST_NESTED_DOTENV=synthetic_public\n');
    mkdirSync(path.join(root, 'scripts'));
    const probe = `console.log(JSON.stringify({ambientLoaded: !!process.env.U1_TEST_NESTED_DOTENV || !!process.env.PUBLIC_U1_TEST_NESTED_DOTENV, explicitPreserved: process.env.U1_TEST_EXPLICIT_CHILD === 'synthetic_explicit'}));`;
    for (const entry of ['build-server.ts', 'build-runtime.ts']) writeFileSync(path.join(root, 'scripts', entry), probe);
    for (const command of ['build:server', 'bundle:server', 'bundle:runtime']) {
      const child = Bun.spawn([process.execPath, '--no-env-file', '--config=/dev/null', 'run', command], {
        cwd: root, stdout: 'pipe', stderr: 'pipe', env: { ...process.env, U1_TEST_EXPLICIT_CHILD: 'synthetic_explicit' }
      });
      try {
        const stdout = new Response(child.stdout).text();
        const stderr = new Response(child.stderr).text();
        expect(await child.exited).toBe(0);
        expect(JSON.parse((await stdout).trim())).toEqual({ ambientLoaded: false, explicitPreserved: true });
        await stderr;
      } finally { if (child.exitCode === null) { child.kill(); await child.exited; } }
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
