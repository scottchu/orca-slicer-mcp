<script lang="ts">
  import { Printer } from 'lucide-svelte';
  import type { ResolvedTextValue } from '../../lib/composable/view-model';
  import Reading from '../common/Reading.svelte';
  import Badge from '../common/Badge.svelte';
  let { value }: { value: ResolvedTextValue } = $props();
  const display = $derived(value.state === 'known' ? value.text ?? 'Unknown' : 'Unknown');
</script>

<Reading icon={Printer}><Badge label="Status" {display} state={value.state} /></Reading>
