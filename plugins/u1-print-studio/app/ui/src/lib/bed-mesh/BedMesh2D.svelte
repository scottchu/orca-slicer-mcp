<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { meshColor } from './palette';
  import type { BedMeshObservation } from './types';

  let { observation }: { observation: BedMeshObservation } = $props();
  let canvas: HTMLCanvasElement;
  let redraw: (() => void) | undefined;
  $effect(() => { observation; untrack(() => redraw?.()); });

  onMount(() => {
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      const pad = Math.max(36, rect.width * 0.1);
      const xSpan = observation.bounds.xMax - observation.bounds.xMin;
      const ySpan = observation.bounds.yMax - observation.bounds.yMin;
      const scale = Math.min((rect.width - pad * 1.7) / xSpan, (rect.height - 74) / ySpan);
      const width = xSpan * scale;
      const height = ySpan * scale;
      const left = (rect.width - width) / 2;
      const top = Math.max(14, (rect.height - height - 44) / 2);
      const cellWidth = width / observation.summary.columns;
      const cellHeight = height / observation.summary.rows;
      for (let row = 0; row < observation.summary.rows; row += 1) {
        for (let column = 0; column < observation.summary.columns; column += 1) {
          const value = observation.matrix[row][column];
          context.fillStyle = meshColor(value, observation.summary.minimum, observation.summary.range);
          context.fillRect(left + column * cellWidth, top + (observation.summary.rows - row - 1) * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
        }
      }
      context.strokeStyle = '#dfe3e6';
      context.lineWidth = 1;
      context.strokeRect(left, top, width, height);
      context.fillStyle = '#737980';
      context.font = '12px Inter, system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText(String(observation.bounds.xMin), left, top + height + 22);
      context.fillText(String(observation.bounds.xMax), left + width, top + height + 22);
      context.fillText('X (mm)', left + width / 2, top + height + 38);
      context.save();
      context.translate(left - 30, top + height / 2);
      context.rotate(-Math.PI / 2);
      context.fillText('Y (mm)', 0, 0);
      context.restore();
      context.textAlign = 'right';
      context.fillText(String(observation.bounds.yMax), left - 8, top + 4);
      context.fillText(String(observation.bounds.yMin), left - 8, top + height);
    };
    const observer = new ResizeObserver(draw);
    redraw = draw;
    observer.observe(canvas);
    draw();
    return () => { observer.disconnect(); redraw = undefined; };
  });
</script>

<canvas bind:this={canvas} data-bed-mesh-2d aria-hidden="true"></canvas>
