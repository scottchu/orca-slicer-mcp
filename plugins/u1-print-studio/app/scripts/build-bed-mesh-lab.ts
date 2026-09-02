import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';
import { assertSelfContained, normalizeLabHtml } from './private-lab-contract';
import { assertWidgetClientModule } from './observation-graph-contract';

const forbiddenSource = /\/(?:components|lib\/client)\/(?:camera|host|live|media)\/|\/fixtures\/observations|\/lab\/observation-fixtures|\/(?:OverviewWidget|ProgressWidget|ThermalsWidget|HeadsWidget|CurrentJobWidget|JobHistoryWidget|QueueWidget|FansWidget)\.svelte|\/src\/routes\//;

await build({
  configFile: false,
  plugins: [svelte(), {
    name: 'bed-mesh-lab-source-boundary',
    generateBundle: (_options, bundle) => {
      for (const value of Object.values(bundle)) {
        if (value.type !== 'chunk') continue;
        if (value.imports.length || value.dynamicImports.length) throw new Error('Bed Mesh lab has a runtime import');
        for (const module of Object.keys(value.modules)) {
          assertWidgetClientModule(module);
          if (forbiddenSource.test(module)) throw new Error(`Bed Mesh lab imports another observation or transport: ${module}`);
        }
      }
    }
  }],
  build: {
    outDir: 'build/bed-mesh-lab',
    emptyOutDir: true,
    minify: 'esbuild',
    lib: { entry: 'src/entrypoints/widgets/bed-mesh-lab.ts', formats: ['iife'], name: 'BedMeshLab', fileName: 'bed-mesh' },
    rollupOptions: { output: { assetFileNames: 'bed-mesh.[ext]' } }
  }
});

const js = readFileSync('build/bed-mesh-lab/bed-mesh.iife.js', 'utf8');
const css = readFileSync('build/bed-mesh-lab/bed-mesh.css', 'utf8');
const html = normalizeLabHtml(`<!doctype html><html lang="en" data-u1-lab-route="bed_mesh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>Bed Mesh</title><style>${css}</style></head><body><script>${js}</script></body></html>`);
assertSelfContained(html);
writeFileSync('build/bed-mesh-lab/index.html', html);
console.log(`private Bed Mesh lab build: ${Buffer.byteLength(html)} bytes`);
