import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync, writeFileSync } from 'node:fs';
const view = process.argv.includes('--thermals') ? 'thermals' : 'fans';
const title = view === 'thermals' ? 'Thermals' : 'Fans & Air';
await build({
  configFile: false, plugins: [svelte()],
  // Preserve whitespace inside bundled string values while emitting an artifact
  // without literal line-end whitespace. Do not trim executable string content.
  esbuild: { supported: { 'template-literal': false } },
  build: {
    outDir: `build-live-${view}`, emptyOutDir: true,
    lib: { entry: `src/live-${view}.ts`, formats: ['iife'], name: 'LiveObservation', fileName: view },
    rollupOptions: {
      output: { assetFileNames: `${view}.[ext]` },
      plugins: [{ name: 'live-observation-production-boundary', generateBundle: (_options, bundle) => {
        for (const item of Object.values(bundle)) if (item.type === 'chunk') for (const module of Object.keys(item.modules)) {
          if (/\/(?:tests|lib\/lab)\/|\/lib\/observation\/(?:fixtures|controller)\.|\/lib\/camera\/|\/three\//.test(module)) {
            throw new Error(`Live ${view} imported nonproduction source: ${module}`);
          }
        }
      } }]
    }
  }
});
const js = readFileSync(`build-live-${view}/${view}.iife.js`, 'utf8');
const css = readFileSync(`build-live-${view}/${view}.css`, 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>U1 · ${title}</title><style>${css}\n#widget-root{width:min(100% - 24px,720px);margin:24px auto}@media(min-width:590px){#widget-root{width:min(100% - 40px,720px);margin-block:40px}}</style></head><body><main id="widget-root"></main><script>${js}</script></body></html>`;
for (const forbidden of ['u1.observation-lab', 'Lab fixture', 'lab_scenario', '__setFansState', 'RTCPeerConnection', 'Three.js', 'test_percent']) {
  if (html.includes(forbidden)) throw new Error(`Live bundle contains forbidden lab/media marker: ${forbidden}`);
}
if (Buffer.byteLength(html) > 100_000) throw new Error(`Live ${view} exceeded its 100 KB single-artifact budget`);
const output = `../public/svelte-live-${view}.html`;
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== html) throw new Error(`Live ${view} package differs from source`);
} else writeFileSync(output, html);
console.log(`live ${view} package: ${Buffer.byteLength(html)} bytes`);
