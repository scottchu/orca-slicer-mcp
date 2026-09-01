import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: true }),
    output: { bundleStrategy: 'inline' },
    version: { name: 'u1-private-bed-mesh-lab-v1', pollInterval: 0 }
  }
};
