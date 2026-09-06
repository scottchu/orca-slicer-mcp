<script lang="ts">
  import { Spool } from 'lucide-svelte';
  import type { ResolvedColorValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Swatch from '../common/Swatch.svelte';
  let { value, appearance = 'default', density = 'regular' }: { value: ResolvedColorValue; density?: 'regular' | 'compact'; appearance?: 'default' | 'quiet' } = $props();
  const display = $derived(value.state === 'known' ? value.hex ?? 'Unknown' : 'Unknown');
</script>

<Reading {density} icon={Spool} appearance={appearance === 'quiet' ? 'quiet' : 'default'}><Swatch {density} label={appearance === 'quiet' ? 'Configured color' : 'Configured filament color'} accessibleLabel={appearance === 'quiet' ? 'Configured filament color' : undefined} color={value.hex} {display} state={value.state} appearance={appearance === 'quiet' ? 'quiet' : 'default'} /></Reading>
