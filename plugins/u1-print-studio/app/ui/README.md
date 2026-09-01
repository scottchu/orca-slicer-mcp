# U1 Svelte widget lab

This is a parallel, static presentation lab governed by decision 0032. It does
not replace the production dashboard or register an MCP resource.

Run from this directory with Bun:

```sh
bun run check
bun run test
bun run build
bun run package:private-lab
bun run test:browser
```

The static lab page is emitted at `build/dashboard/lab/bed_mesh/index.html`.
`package:private-lab` copies that deterministic self-contained page to the
parent application's generated public source. The private dashboard bundle
serves it at the exact lab route; the public server, directory and MCP resource
inventory do not.

`src/lib/embed.ts` is the future host boundary: callers inject one normalized
presentation value into `mountBedMeshWidget`. Components contain no printer or
network client. `bun run build:embed` remains an explicit development scaffold;
its large generic bundle is not part of `ui:build`, the server bundle input,
the release manifest or any MCP widget. Generated browser screenshots remain
under ignored `test-results/` and are validation evidence, not shipped assets.
