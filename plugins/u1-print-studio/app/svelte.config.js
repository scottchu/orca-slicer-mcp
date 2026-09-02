import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { isolatedKitEnvDirectory } from './scripts/isolated-kit-env.js';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ out: 'build-kit', precompress: false, envPrefix: 'U1_KIT_' }),
    alias: { $components: 'src/components' },
    files: { assets: 'static' },
    // Kit has its own dotenv loader, separate from Vite's envDir setting.
    // Keep explicit process.env support while isolating ambient .env files.
    env: { dir: isolatedKitEnvDirectory(fileURLToPath(new URL('./config/no-dotenv', import.meta.url))) },
    // OAuth token clients submit forms across origins without a browser Origin.
    // Preserve the existing PKCE/token-binding and WebAuthn origin contracts.
    csrf: { trustedOrigins: ['*'] },
    prerender: { entries: ['/dashboard/fans', '/dashboard/thermals', '/dashboard/heads', '/dashboard/queue'], crawl: false },
    version: { name: 'u1-unified-app-v1', pollInterval: 0 }
  }
};
