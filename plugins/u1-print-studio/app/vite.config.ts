import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // Runtime secrets belong to the supervised service, never to compiled assets.
  envDir: false,
  build: { minify: 'esbuild', sourcemap: false }
});
