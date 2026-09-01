import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeLabHtml, assertSelfContained } from './private-lab-contract';

await build({
  configFile: false,
  plugins: [svelte(), {
    name: 'synthetic-camera-source-boundary',
    generateBundle: (_options, bundle) => {
      for (const value of Object.values(bundle)) {
        if (value.type !== 'chunk') continue;
        if (value.imports.length || value.dynamicImports.length) throw new Error('Camera lab has a runtime import');
        for (const module of Object.keys(value.modules)) {
          if (/node_modules\/three\/|\/lib\/(?:host|bed-mesh|observation)\/|\/camera\/session\.ts/.test(module)) throw new Error('Camera lab imports a non-synthetic dependency');
        }
      }
    }
  }],
  build: {
    outDir: 'build/camera-lab', emptyOutDir: true, minify: 'esbuild',
    lib: { entry: 'src/camera-lab.ts', formats: ['iife'], name: 'CameraLab', fileName: 'camera' },
    rollupOptions: { output: { assetFileNames: 'camera.[ext]' } }
  }
});
const js = readFileSync('build/camera-lab/camera.iife.js', 'utf8');
const css = readFileSync('build/camera-lab/camera.css', 'utf8');
const html = normalizeLabHtml(`<!doctype html><html lang="en" data-u1-lab-route="camera"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>U1 Camera</title><style>${css}</style></head><body><script>${js}</script></body></html>`);
assertSelfContained(html);
writeFileSync('build/camera-lab/index.html', html);
console.log(`private Camera lab build: ${Buffer.byteLength(html)} bytes`);
