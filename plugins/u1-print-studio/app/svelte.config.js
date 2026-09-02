import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ out: 'build-kit', precompress: false, envPrefix: 'U1_KIT_' }),
    alias: { $components: 'src/components' },
    files: { assets: 'static' },
    // OAuth token clients submit forms across origins without a browser Origin.
    // Preserve the existing PKCE/token-binding and WebAuthn origin contracts.
    csrf: { trustedOrigins: ['*'] },
    prerender: { entries: ['/dashboard/fans'], crawl: false },
    version: { name: 'u1-unified-app-v1', pollInterval: 0 }
  }
};
