<script lang="ts">
  import { Bed, Box, Camera, Fan, FileClock, Grid3X3, History, Layers3, LayoutDashboard, ListOrdered, Printer, RefreshCw, Spool, Thermometer, ThermometerSun } from 'lucide-svelte';
  const icons = { bed: Bed, box: Box, camera: Camera, fan: Fan, jobs: FileClock, mesh: Grid3X3, history: History, heads: Layers3, overview: LayoutDashboard, queue: ListOrdered, progress: Printer, refresh: RefreshCw, spool: Spool, thermometer: Thermometer, thermals: ThermometerSun };
  type Accessibility = { decorative?: true; label?: never } | { decorative: false; label: string };
  let { name, decorative = true, label }: { name: keyof typeof icons } & Accessibility = $props();
  const Glyph = $derived(icons[name]);
</script>

<Glyph size={20} strokeWidth={1.8} aria-hidden={decorative ? true : undefined} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : label} />
