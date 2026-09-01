import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';
await build({
  configFile: false, plugins: [svelte()],
  build: {
    outDir: 'build-live-fans', emptyOutDir: true,
    lib: { entry: 'src/live-fans.ts', formats: ['iife'], name: 'LiveFans', fileName: 'fans' },
    rollupOptions: { output: { assetFileNames: 'fans.[ext]' } }
  }
});
const js = readFileSync('build-live-fans/fans.iife.js', 'utf8');
const css = readFileSync('build-live-fans/fans.css', 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>U1 · Fans & Air</title><style>${css}\n#widget-root{width:min(100% - 24px,720px);margin:24px auto}@media(min-width:590px){#widget-root{width:min(100% - 40px,720px);margin-block:40px}}</style></head><body><main id="widget-root"></main><script>${js}</script></body></html>`;
for (const forbidden of ['u1.observation-lab', 'Lab fixture', 'lab_scenario', '__setFansState', 'RTCPeerConnection', 'Three.js', 'test_percent']) {
  if (html.includes(forbidden)) throw new Error(`Live bundle contains forbidden lab/media marker: ${forbidden}`);
}
if (Buffer.byteLength(html) > 100_000) throw new Error('Live Fans exceeded its 100 KB single-artifact budget');
const output = '../public/svelte-live-fans.html';
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== html) throw new Error('Live Fans package differs from source');
} else writeFileSync(output, html);
console.log(`live Fans package: ${Buffer.byteLength(html)} bytes`);
