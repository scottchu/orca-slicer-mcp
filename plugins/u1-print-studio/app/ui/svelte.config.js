import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined, strict: true }),
    output: { bundleStrategy: 'inline' },
    prerender: { entries: ['/'], crawl: false },
    version: { name: 'u1-private-observation-lab-v1', pollInterval: 0 }
  }
};
