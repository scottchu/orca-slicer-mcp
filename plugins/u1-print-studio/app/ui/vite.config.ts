import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { assertObservationLabModule } from './scripts/observation-graph-contract';

export default defineConfig({
  plugins: [sveltekit(), {
    name: 'light-observation-lab-source-boundary',
    generateBundle: (_options, bundle) => {
      for (const value of Object.values(bundle)) {
        if (value.type !== 'chunk') continue;
        if (value.dynamicImports.length) throw new Error(`Light observation lab has a dynamic import: ${value.dynamicImports.join(', ')}`);
        for (const module of Object.keys(value.modules)) {
          if (/node_modules\/three\/|\/examples\/jsm\/controls\/OrbitControls|\/lib\/bed-mesh\/|\/fixtures\/bed-mesh/.test(module)) {
            throw new Error(`Light observation lab imports Bed Mesh rendering code: ${module}`);
          }
        }
      }
    }
  }],
  resolve: { conditions: ['browser'] },
  build: { rollupOptions: { plugins: [{
    name: 'observation-client-graph-boundary',
    generateBundle: (_options, bundle) => {
      const chunks = Object.values(bundle).filter((item) => item.type === 'chunk');
      // Kit invokes the config for both SSR and browser builds. Only the inline
      // browser entry establishes the shipped client dependency boundary.
      if (!chunks.some((item) => item.fileName.includes('immutable/bundle.'))) return;
      const modules = chunks.flatMap((item) => Object.entries(item.modules).map(([id, value]) => ({ id, renderedLength: value.renderedLength, originalLength: value.originalLength })));
      for (const { id } of modules) assertObservationLabModule(id);
      mkdirSync('test-results/build-graphs', { recursive: true });
      writeFileSync('test-results/build-graphs/observation-client.json', JSON.stringify(modules, null, 2));
    }
  }] } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test-setup.ts']
  }
});
