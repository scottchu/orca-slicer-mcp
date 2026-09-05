import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { NATIVE_DASHBOARD_VIEWS } from '../src/lib/server/route-policy';

const root = path.resolve(import.meta.dir, '..');
const argument = process.argv.indexOf('--outdir');
const output = path.resolve(argument < 0 ? path.join(root, 'dist') : process.argv[argument + 1]);
mkdirSync(path.join(root, 'test-results/server-builds'), { recursive: true });
const staging = mkdtempSync(path.join(root, 'test-results/server-builds/build-'));
const run = async (command: string[]): Promise<void> => {
  const child = Bun.spawn(command, { cwd: root, stdout: 'inherit', stderr: 'inherit', stdin: 'ignore' });
  try { if (await child.exited !== 0) throw new Error('Server build failed'); }
  finally { if (child.exitCode === null) { child.kill(); await child.exited; } }
};
await run([process.execPath, '--no-env-file', '--config=/dev/null', 'node_modules/vite/bin/vite.js', 'build']);

for (const [entrypoint, name] of [['src/entrypoints/server.ts', 'server.js'], ['build-kit/handler.js', 'handler.js']]) {
  const result = await Bun.build({
    entrypoints: [path.join(root, entrypoint)], target: 'bun', outdir: staging,
    naming: { entry: name, asset: '[name].[ext]' }, minify: true,
    sourcemap: 'none', splitting: false
  });
  if (!result.success) throw new AggregateError(result.logs, `Failed to bundle ${name}`);
}
for (const folder of ['client', 'prerendered']) cpSync(path.join(root, 'build-kit', folder), path.join(staging, folder), { recursive: true });

type StaticRoute = { file: string; sha256: string; role: 'dashboard' | 'public' | 'both' };
const staticRoutes: Record<string, StaticRoute> = {};
const digest = (file: string): string => createHash('sha256').update(readFileSync(file)).digest('hex');
const route = (url: string, file: string, role: StaticRoute['role'] = 'dashboard'): void => {
  if (staticRoutes[url]) throw new Error(`Duplicate static route: ${url}`);
  staticRoutes[url] = { file, sha256: digest(path.join(staging, file)), role };
};
const staticPage = (urls: string[], file: string, role: StaticRoute['role'] = 'dashboard'): void => {
  const target = `static-contract/${file}`;
  mkdirSync(path.join(staging, 'static-contract'), { recursive: true });
  cpSync(path.join(root, 'public', file), path.join(staging, target));
  for (const url of urls) route(url, target, role);
};
route('/widget', 'mcp-observation.html', 'both');
staticPage(['/dashboard', '/dashboard/'], 'dashboard-index.html');
staticPage(['overview', 'progress', 'jobs', 'job_history', 'bed_mesh'].map((view) => `/dashboard/${view}`), 'status-dashboard-host.html');
staticPage(['/dashboard/camera'], 'camera-dashboard-host.html');
for (const view of ['fans', 'thermals', 'heads', 'queue', 'camera']) staticPage([`/dashboard/${view}_widget`], `svelte-live-${view}.html`);
const lab = (urls: string[], file: string): void => staticPage(urls.flatMap((url) => [url, `${url}/`]), file);
lab(['/dashboard/lab', ...['overview', 'progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans'].map((view) => `/dashboard/lab/${view}`)], 'svelte-observation-lab.html');
lab(['/dashboard/lab/bed_mesh'], 'svelte-bed-mesh-lab.html');
lab(['/dashboard/lab/camera'], 'svelte-camera-lab.html');
for (const view of NATIVE_DASHBOARD_VIEWS) route(`/dashboard/${view}`, `prerendered/dashboard/${view}.html`);
route('/dashboard/lab/composition', 'prerendered/dashboard/lab/composition.html');
const files = (folder: string, prefix = ''): string[] => readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
  if (entry.isSymbolicLink()) throw new Error('Build output contains symlink');
  const name = prefix + entry.name;
  return entry.isDirectory() ? files(path.join(folder, entry.name), `${name}/`) : [name];
});
for (const file of files(path.join(staging, 'client'))) route(`/${file}`, `client/${file}`);
const runtimeFiles = Object.fromEntries(files(staging).sort().map((file) => [file, digest(path.join(staging, file))]));
const manifest = { schemaVersion: 2, buildKind: 'sveltekit-bun', runtimeFiles, staticRoutes };
writeFileSync(path.join(staging, 'build-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
mkdirSync(output, { recursive: true });
// Copy only this build's explicit payload; never remove unrelated CLI/stdin builds.
for (const file of [...Object.keys(runtimeFiles), 'build-manifest.json']) {
  mkdirSync(path.dirname(path.join(output, file)), { recursive: true });
  cpSync(path.join(staging, file), path.join(output, file));
}
console.log(`SvelteKit server: ${Object.keys(runtimeFiles).length} files, ${Object.keys(staticRoutes).length} static routes, ${Object.values(runtimeFiles).length} hashes`);
