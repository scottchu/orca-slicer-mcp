import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'build-embed',
    emptyOutDir: true,
    lib: {
      entry: 'src/lib/embed.ts',
      formats: ['es'],
      fileName: 'u1-widgets'
    },
    rollupOptions: {
      output: { assetFileNames: 'u1-widgets.[ext]' }
    }
  }
});
