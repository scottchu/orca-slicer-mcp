<script lang="ts">
  import BedMeshWidget from '../../src/lib/bed-mesh/BedMeshWidget.svelte';
  import { bedMeshLabFixture } from '../../src/lib/fixtures/bed-mesh';
  let observation = $state(bedMeshLabFixture);
  let visible = $state(true);
  const set = (rows: number, columns: number, mode: string) => {
    const matrix = Array.from({ length: rows }, (_, r) => Array.from({ length: columns }, (_, c) => mode === 'zero' ? 0 : mode === 'flat' ? 0.3 : mode === 'negative' ? -0.8 - r * 0.01 - c * 0.005 : mode === 'tiny' ? (r + c) * 1e-8 : (r - c) * 0.015));
    const minimum = Math.min(...matrix.flat());
    const maximum = Math.max(...matrix.flat());
    observation = { ...bedMeshLabFixture, matrix, bounds: mode === 'rectangle' ? { xMin: -20, xMax: 300, yMin: 10, yMax: 170 } : bedMeshLabFixture.bounds, summary: { rows, columns, minimum, maximum, range: maximum - minimum } };
  };
  Object.assign(window, { meshHarness: { set, remove: () => { visible = false; } } });
</script>
<main>{#if visible}<BedMeshWidget {observation} />{/if}</main>
<style>main { max-width: 720px; margin: 0 auto; padding: 12px; box-sizing: border-box; }</style>
