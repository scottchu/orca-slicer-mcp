<script lang="ts">
  import { onMount } from 'svelte';
  import type { ToolpathGeometry } from '../../lib/toolpath';
  let { geometry, layer, view }: { geometry?: ToolpathGeometry; layer: number | null; view: '3d' | 'top' } = $props();
  let canvas: HTMLCanvasElement;
  let mounted = $state(false), yaw = $state(-.75), pitch = $state(.55);
  let frame = 0, dragging: { x: number; y: number } | null = null;
  const paths = $derived(geometry?.paths.map(path => {
    const points = new Float64Array(path.d.length), current = [0, 0, 0];
    for (let i = 0; i < path.d.length; i++) { const axis = i % 3; current[axis]! += path.d[i]!; points[i] = current[axis]! / 100_000; }
    return { layer: path.layer, points };
  }) ?? []);
  const draw = () => {
    if (!mounted || !canvas) return;
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, rect.width * dpr); canvas.height = Math.max(1, rect.height * dpr);
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, rect.width, rect.height);
    if (!geometry) return;
    const mid = geometry.bounds.map(([a, b]) => (a + b) / 2);
    const angle = view === 'top' ? 0 : yaw, tilt = view === 'top' ? Math.PI / 2 : pitch;
    const project = (x: number, y: number, z: number) => {
      const a = x - mid[0]!, b = y - mid[1]!, c = z - mid[2]!;
      const u = a * Math.cos(angle) - b * Math.sin(angle), v = a * Math.sin(angle) + b * Math.cos(angle);
      return [u, v * Math.sin(tilt) - c * Math.cos(tilt)];
    };
    const corners: number[][] = [];
    for (const x of geometry.bounds[0]!) for (const y of geometry.bounds[1]!) for (const z of geometry.bounds[2]!) corners.push(project(x, y, z));
    const minX = Math.min(...corners.map(p => p[0]!)), maxX = Math.max(...corners.map(p => p[0]!));
    const minY = Math.min(...corners.map(p => p[1]!)), maxY = Math.max(...corners.map(p => p[1]!));
    const scale = Math.min((rect.width - 36) / Math.max(maxX - minX, .1), (rect.height - 36) / Math.max(maxY - minY, .1));
    const colors = getComputedStyle(canvas), ink = colors.getPropertyValue('--u1-muted').trim() || '#6b7280', accent = colors.getPropertyValue('--u1-accent').trim() || '#078577';
    // Two passes keep the current layer legible without pretending this canvas
    // resolves physical occlusion, extrusion width or camera-observed material.
    for (const highlighted of [false, true]) for (const path of paths) {
      const selected = layer !== null && path.layer === layer; if (selected !== highlighted) continue;
      ctx.strokeStyle = selected ? accent : ink; ctx.globalAlpha = selected ? 1 : layer !== null && path.layer > layer ? .12 : .5;
      ctx.lineWidth = selected ? 1.8 : .75; ctx.beginPath();
      for (let i = 0; i < path.points.length; i += 3) {
        const p = project(path.points[i]!, path.points[i + 1]!, path.points[i + 2]!);
        const x = rect.width / 2 + p[0]! * scale, y = rect.height / 2 + p[1]! * scale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
  $effect(() => { geometry; paths; layer; view; yaw; pitch; if (mounted) schedule(); });
  onMount(() => {
    mounted = true; const resize = new ResizeObserver(schedule); resize.observe(canvas);
    const theme = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null; theme?.addEventListener('change', schedule);
    return () => { mounted = false; resize.disconnect(); theme?.removeEventListener('change', schedule); cancelAnimationFrame(frame); };
  });
  const pointerDown = (event: PointerEvent) => { if (!geometry || view === 'top') return; canvas.setPointerCapture(event.pointerId); dragging = { x: event.clientX, y: event.clientY }; };
  const pointerMove = (event: PointerEvent) => { if (!dragging) return; yaw += (event.clientX - dragging.x) * .012; pitch = Math.max(.1, Math.min(1.5, pitch + (event.clientY - dragging.y) * .009)); dragging = { x: event.clientX, y: event.clientY }; };
</script>
<canvas bind:this={canvas} aria-hidden="true" onpointerdown={pointerDown} onpointermove={pointerMove} onpointerup={() => { dragging = null; }} onpointercancel={() => { dragging = null; }} onlostpointercapture={() => { dragging = null; }}></canvas>
<style>canvas { display: block; width: 100%; height: 100%; touch-action: pan-y; cursor: grab; } canvas:active { cursor: grabbing; }</style>
