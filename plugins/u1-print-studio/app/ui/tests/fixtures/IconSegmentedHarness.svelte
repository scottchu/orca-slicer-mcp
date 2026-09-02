<script lang="ts">
  import { Box, Grid2X2 } from 'lucide-svelte';
  import IconSegmentedControl from '../../src/lib/ui/IconSegmentedControl.svelte';
  import '../../src/lib/ui/tokens.css';
  let value = $state<'cube' | 'grid'>('cube');
  let disabled = $state(false), loading = $state(false), reversed = $state(false), count = $state(0);
  const cube = { value: 'cube', label: 'Surface', icon: Box } as const;
  const grid = { value: 'grid', label: 'Grid', icon: Grid2X2 } as const;
  const options = $derived(reversed ? [grid, cube] as const : [cube, grid] as const);
  const change = (next: 'cube' | 'grid') => { count++; value = next; };
</script>
<button onclick={() => { value = value === 'cube' ? 'grid' : 'cube'; }}>External value</button>
{#if loading}<IconSegmentedControl label="Test view" {options} loading />
{:else}<IconSegmentedControl label="Test view" {options} {value} {disabled} onchange={change} />{/if}
<button onclick={() => { disabled = !disabled; }}>Toggle disabled</button>
<button onclick={() => { loading = !loading; }}>Toggle loading</button>
<button onclick={() => { reversed = !reversed; }}>Reverse options</button>
<output aria-label="Change count">{count}</output>
