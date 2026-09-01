import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

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
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test-setup.ts']
  }
});
