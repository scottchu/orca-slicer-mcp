<script lang="ts">
  import { Bed, Box, Fan, RefreshCw, Thermometer, ThermometerSun } from 'lucide-svelte';
  const icons = { bed: Bed, box: Box, fan: Fan, refresh: RefreshCw, thermometer: Thermometer, thermals: ThermometerSun };
  type Accessibility = { decorative?: true; label?: never } | { decorative: false; label: string };
  let { name, decorative = true, label }: { name: keyof typeof icons } & Accessibility = $props();
  const Glyph = $derived(icons[name]);
</script>

<Glyph size={20} strokeWidth={1.8} aria-hidden={decorative ? true : undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} />
