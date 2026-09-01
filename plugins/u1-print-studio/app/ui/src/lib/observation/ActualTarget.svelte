<script lang="ts">
  import DegreeValue from '../ui/DegreeValue.svelte';
  import Inline from '../ui/Inline.svelte';
  import Label from '../ui/Label.svelte';
  let { actual, target, loading = false, compact = false }: { actual?: number | null; target?: number | null; loading?: boolean; compact?: boolean } = $props();
</script>

<Inline align="baseline" gap="tight" shrink={false} label="Actual and target temperature">
  <DegreeValue value={actual} {loading} context="Actual" emphasis={compact ? 'secondary' : 'primary'} /><Label text="/" tone="muted" /><DegreeValue value={target} {loading} context="Target" emphasis="secondary" />
</Inline>
