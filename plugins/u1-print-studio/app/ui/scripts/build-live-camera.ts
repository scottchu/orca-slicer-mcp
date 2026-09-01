import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { assertLiveCameraArtifact, assertLiveCameraModule } from './live-camera-contract';

await build({
  configFile: false, plugins: [svelte()], esbuild: { supported: { 'template-literal': false } },
  build: {
    outDir: 'build-live-camera', emptyOutDir: true,
    lib: { entry: 'src/live-camera.ts', formats: ['iife'], name: 'LiveCamera', fileName: 'camera' },
    rollupOptions: { output: { assetFileNames: 'camera.[ext]' }, plugins: [{ name: 'live-camera-production-boundary', generateBundle: (_options, bundle) => {
      const chunks = Object.values(bundle).filter((item) => item.type === 'chunk');
      if (chunks.length !== 1 || chunks[0].imports.length || chunks[0].dynamicImports.length) throw new Error('Live Camera must have one closed executable graph');
      for (const item of chunks) for (const module of Object.keys(item.modules)) assertLiveCameraModule(module);
    } }] },
  },
});
const js = readFileSync('build-live-camera/camera.iife.js', 'utf8');
const css = readFileSync('build-live-camera/camera.css', 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>U1 · Camera</title><style>${css}\n#widget-root{width:min(100% - 24px,720px);margin:24px auto}@media(min-width:590px){#widget-root{width:min(100% - 40px,720px);margin-block:40px}}</style></head><body><main id="widget-root"></main><script>${js}</script></body></html>`;
assertLiveCameraArtifact(html);
writeFileSync('build-live-camera/camera.html', html);
const output = '../public/svelte-live-camera.html';
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== html) throw new Error('Live Camera package differs from source');
} else writeFileSync(output, html);
console.log(`live Camera package: ${Buffer.byteLength(html)} bytes SHA256 ${createHash('sha256').update(html).digest('hex')}`);
