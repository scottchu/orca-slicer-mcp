import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { assertObservationLabModule } from './observation-graph-contract';
import { assertSelfContained, normalizeLabHtml } from './private-lab-contract';

await build({
  configFile: false, envDir: false,
  plugins: [svelte()],
  build: {
    outDir: 'build/observation-lab', emptyOutDir: true, minify: 'esbuild',
    lib: { entry: 'src/entrypoints/widgets/observation-lab.ts', formats: ['iife'], name: 'ObservationLab', fileName: 'observation' },
    rollupOptions: {
      output: { assetFileNames: 'observation.[ext]' },
      plugins: [{ name: 'observation-client-graph-boundary', generateBundle: (_options, bundle) => {
        const modules = [];
        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== 'chunk') continue;
          if (chunk.imports.length || chunk.dynamicImports.length) throw new Error('Observation lab has a runtime import');
          for (const [id, module] of Object.entries(chunk.modules)) {
            assertObservationLabModule(id);
            if (/node_modules\/three\/|\/examples\/jsm\/controls\/OrbitControls|\/(?:components|lib\/client)\/bed-mesh\/|\/fixtures\/bed-mesh/.test(id)) throw new Error('Light observation lab imports Bed Mesh rendering code');
            modules.push({ id, renderedLength: module.renderedLength, originalLength: module.originalLength });
          }
        }
        mkdirSync('test-results/build-graphs', { recursive: true });
        writeFileSync('test-results/build-graphs/observation-client.json', JSON.stringify(modules, null, 2));
      } }]
    }
  }
});
const js = readFileSync('build/observation-lab/observation.iife.js', 'utf8');
const css = readFileSync('build/observation-lab/observation.css', 'utf8');
const html = normalizeLabHtml(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title></title><style>${css}</style></head><body><div data-route-bootstrap hidden></div><script>${js}</script></body></html>`);
assertSelfContained(html);
writeFileSync('build/observation-lab/index.html', html);
console.log(`private observation lab build: ${Buffer.byteLength(html)} bytes`);
