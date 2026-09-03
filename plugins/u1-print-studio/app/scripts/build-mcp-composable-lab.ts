import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';

await build({
  configFile: false,
  plugins: [svelte()],
  build: {
    outDir: 'build-mcp-composable-lab',
    emptyOutDir: true,
    lib: { entry: 'src/entrypoints/widgets/composable-lab.ts', formats: ['iife'], name: 'ComposableLab', fileName: 'composable-lab' },
    rollupOptions: {
      output: { assetFileNames: 'composable-lab.[ext]' },
      plugins: [{
        name: 'composable-experiment-boundary',
        generateBundle: (_options, bundle) => {
          const chunks = Object.values(bundle).filter((item) => item.type === 'chunk');
          if (chunks.length !== 1 || chunks[0].imports.length || chunks[0].dynamicImports.length) throw new Error('Composable experiment must have one closed executable graph');
          for (const chunk of chunks) for (const id of Object.keys(chunk.modules)) {
            if (/\/lib\/server\/|\.(?:test|spec)\.[cm]?[jt]sx?$|\/fixtures\//u.test(id)) throw new Error(`Composable resource imported forbidden source: ${id}`);
          }
        },
      }],
    },
  },
});
const js = readFileSync('build-mcp-composable-lab/composable-lab.iife.js', 'utf8');
const css = readFileSync('build-mcp-composable-lab/composable-lab.css', 'utf8');
if (/<\/script/iu.test(js) || /<\/style/iu.test(css)) throw new Error('Inline resource delimiter in executable assets');
const whitespaceLiteral = ' \t\n';
if (js.split(whitespaceLiteral).length !== 2) throw new Error('Unexpected executable whitespace literal');
const embeddedJs = js.replace(whitespaceLiteral, '\\x20\\t\\n');
if (/[ \t]+\r?\n/u.test(css) || /[ \t]+\r?\n/u.test(embeddedJs)) throw new Error('Inline assets contain trailing whitespace');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>U1 composable lab</title><style>${css}</style></head><body><main id="widget-root"></main><script>${embeddedJs}</script></body></html>`;
const output = 'public/mcp-composable-lab.html';
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== html) throw new Error('Composable experiment resource differs from source');
} else writeFileSync(output, html);
console.log(`Composable experiment resource: ${Buffer.byteLength(html)} bytes`);
