<script lang="ts">
  import DegreeValue from '../ui/DegreeValue.svelte';
  import Inline from '../ui/Inline.svelte';
  import Label from '../ui/Label.svelte';
  let { actual, target, loading = false }: { actual?: number | null; target?: number | null; loading?: boolean } = $props();
</script>

<Inline align="baseline" gap="tight" shrink={false} label="Actual and target temperature">
  <DegreeValue value={actual} {loading} context="Actual" /><Label text="/" tone="muted" /><DegreeValue value={target} {loading} context="Target" emphasis="secondary" />
</Inline>
