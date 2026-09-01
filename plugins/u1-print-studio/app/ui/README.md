# U1 Svelte widget lab

This is a parallel, static presentation lab governed by decision 0032. It does
not replace the production dashboard or register an MCP resource.

Run from this directory with Bun:

```sh
bun run check
bun run test
bun run build
bun run build:embed
bun run test:browser
```

The static lab page is emitted at `build/dashboard/lab/bed_mesh/index.html`.
`src/lib/embed.ts` is the future host boundary: callers inject one normalized
presentation value into `mountBedMeshWidget`. Components contain no printer or
network client. Generated browser screenshots remain under ignored
`test-results/` and are validation evidence, not shipped assets.
