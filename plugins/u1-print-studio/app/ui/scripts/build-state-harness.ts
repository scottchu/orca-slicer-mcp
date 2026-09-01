import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';

await build({
  configFile: false, plugins: [svelte()],
  build: {
    outDir: 'test-results/state-harness', emptyOutDir: true,
    lib: { entry: 'tests/fixtures/thermals.ts', formats: ['iife'], name: 'ThermalsHarness', fileName: 'thermals' },
    rollupOptions: { output: { assetFileNames: 'thermals.[ext]' } }
  }
});
const js = readFileSync('test-results/state-harness/thermals.iife.js', 'utf8');
const css = readFileSync('test-results/state-harness/thermals.css', 'utf8');
writeFileSync('test-results/state-harness.html', `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thermals state test</title><style>${css}</style></head><body><script>${js}</script></body></html>`);
