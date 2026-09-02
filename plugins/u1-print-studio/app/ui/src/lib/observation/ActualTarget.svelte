<script lang="ts">
  import DegreeValue from '../common/DegreeValue.svelte';
  import Inline from '../common/Inline.svelte';
  import Label from '../common/Label.svelte';
  let { actual, target, loading = false, compact = false }: { actual?: number | null; target?: number | null; loading?: boolean; compact?: boolean } = $props();
</script>

<Inline align="baseline" gap="tight" shrink={false} label="Actual and target temperature">
  <DegreeValue value={actual} {loading} context="Actual" emphasis={compact ? 'secondary' : 'primary'} /><Label text="/" tone="muted" /><DegreeValue value={target} {loading} context="Target" emphasis="secondary" />
</Inline>
