<script lang="ts">
  import { Spool } from 'lucide-svelte';
  import type { ResolvedColorValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Swatch from '../common/Swatch.svelte';
  let { value, appearance = 'default' }: { value: ResolvedColorValue; appearance?: 'default' | 'quiet' } = $props();
  const display = $derived(value.state === 'known' ? value.hex ?? 'Unknown' : 'Unknown');
</script>

<Reading icon={Spool} appearance={appearance === 'quiet' ? 'quiet' : 'default'}><Swatch label="Configured filament color" color={value.hex} {display} state={value.state} appearance={appearance === 'quiet' ? 'quiet' : 'default'} /></Reading>
