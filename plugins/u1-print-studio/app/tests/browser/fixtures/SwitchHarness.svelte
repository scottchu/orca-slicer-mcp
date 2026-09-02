<script lang="ts">
  import { Box, Grid2X2, List } from 'lucide-svelte';
  import Switch from '../../../src/components/common/Switch.svelte';
  import '../../../src/components/common/tokens.css';
  let value = $state<'cube' | 'grid' | 'list'>('cube');
  let disabled = $state(false), loading = $state(false), reversed = $state(false), count = $state(0), three = $state(false);
  const cube = { value: 'cube', label: 'Surface', icon: Box } as const;
  const grid = { value: 'grid', label: 'Grid', icon: Grid2X2 } as const;
  const list = { value: 'list', label: 'List', icon: List } as const;
  const options = $derived(three ? [cube, grid, list] as const : reversed ? [grid, cube] as const : [cube, grid] as const);
  const change = (next: 'cube' | 'grid' | 'list') => { count++; value = next; };
</script>
<button onclick={() => { value = value === 'cube' ? 'grid' : 'cube'; }}>External value</button>
{#if loading}<Switch label="Test view" {options} loading />
{:else}<Switch label="Test view" {options} {value} {disabled} onchange={change} />{/if}
<button onclick={() => { disabled = !disabled; }}>Toggle disabled</button>
<button onclick={() => { loading = !loading; }}>Toggle loading</button>
<button onclick={() => { reversed = !reversed; }}>Reverse options</button>
<output aria-label="Change count">{count}</output>

<button onclick={() => { three = !three; if (!three && value === 'list') value = 'cube'; }}>Toggle third option</button>
