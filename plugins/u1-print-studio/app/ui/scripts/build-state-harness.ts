import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';

for (const name of ['thermals', 'percentage']) {
await build({
  configFile: false, plugins: [svelte()],
  build: {
    outDir: `test-results/${name}-harness`, emptyOutDir: true,
    lib: { entry: `tests/fixtures/${name}.ts`, formats: ['iife'], name: 'StateHarness', fileName: name },
    rollupOptions: { output: { assetFileNames: `${name}.[ext]` } }
  }
});
const js = readFileSync(`test-results/${name}-harness/${name}.iife.js`, 'utf8');
const css = readFileSync(`test-results/${name}-harness/${name}.css`, 'utf8');
writeFileSync(`test-results/${name}-harness.html`, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} state test</title><style>${css}</style></head><body><script>${js}</script></body></html>`);
}
