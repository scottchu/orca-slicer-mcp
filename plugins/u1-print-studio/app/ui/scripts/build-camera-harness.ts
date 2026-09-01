import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';

await build({
  configFile: false, plugins: [svelte()],
  build: {
    outDir: 'test-results/camera-harness', emptyOutDir: true,
    lib: { entry: 'tests/fixtures/camera.ts', formats: ['iife'], name: 'CameraHarness', fileName: 'camera' },
    rollupOptions: { output: { assetFileNames: 'camera.[ext]' } },
  },
});
const js = readFileSync('test-results/camera-harness/camera.iife.js', 'utf8');
const css = readFileSync('test-results/camera-harness/camera.css', 'utf8');
writeFileSync('test-results/camera-harness.html', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Camera fixture</title><style>${css}</style></head><body><script>${js}</script></body></html>`);
