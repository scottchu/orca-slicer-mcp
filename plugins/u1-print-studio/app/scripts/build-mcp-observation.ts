import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';
import { assertWidgetClientModule } from './observation-graph-contract';

await build({
  configFile: false,
  plugins: [svelte()],
  esbuild: { supported: { 'template-literal': false } },
  build: {
    outDir: 'build-mcp-observation',
    emptyOutDir: true,
    lib: {
      entry: 'src/entrypoints/widgets/mcp-observation.ts',
      formats: ['iife'],
      name: 'McpObservation',
      fileName: 'observation',
    },
    rollupOptions: {
      output: { assetFileNames: 'observation.[ext]' },
      plugins: [
        {
          name: 'mcp-observation-production-boundary',
          generateBundle: (_options, bundle) => {
            const chunks = Object.values(bundle).filter((item) => item.type === 'chunk');
            if (chunks.length !== 1 || chunks[0].imports.length || chunks[0].dynamicImports.length)
              throw new Error('MCP observation must have one closed executable graph');
            for (const chunk of chunks)
              for (const id of Object.keys(chunk.modules)) {
                assertWidgetClientModule(id);
                if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:tests|lab|fixtures|camera)\//.test(id))
                  throw new Error(`MCP observation imported nonproduction source: ${id}`);
              }
          },
        },
      ],
    },
  },
});
const js = readFileSync('build-mcp-observation/observation.iife.js', 'utf8');
const css = readFileSync('build-mcp-observation/observation.css', 'utf8');
if (/<\/script/i.test(js) || /<\/style/i.test(css))
  throw new Error('Inline widget delimiter in executable assets');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>U1 Printer Observation</title><style>${css}</style></head><body><main id="widget-root"></main><script>${js}</script></body></html>`;
const output = 'public/mcp-observation.html';
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== html)
    throw new Error('MCP observation package differs from source');
} else writeFileSync(output, html);
console.log(`MCP observation package: ${Buffer.byteLength(html)} bytes`);
