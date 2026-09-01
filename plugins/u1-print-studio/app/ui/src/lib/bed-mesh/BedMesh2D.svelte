<script lang="ts">
  import { onMount } from 'svelte';
  import { meshColor } from './palette';
  import type { BedMeshObservation } from './types';

  let { observation }: { observation: BedMeshObservation } = $props();
  let canvas: HTMLCanvasElement;

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
      const size = Math.min(rect.width - pad * 1.7, rect.height - 74);
      const left = (rect.width - size) / 2;
      const top = Math.max(14, (rect.height - size - 44) / 2);
      const cellWidth = size / observation.summary.columns;
      const cellHeight = size / observation.summary.rows;
      for (let row = 0; row < observation.summary.rows; row += 1) {
        for (let column = 0; column < observation.summary.columns; column += 1) {
          const value = observation.matrix[row][column];
          context.fillStyle = meshColor(value, observation.summary.minimum, observation.summary.range);
          context.fillRect(left + column * cellWidth, top + (observation.summary.rows - row - 1) * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
        }
      }
      context.strokeStyle = '#dfe3e6';
      context.lineWidth = 1;
      context.strokeRect(left, top, size, size);
      context.fillStyle = '#737980';
      context.font = '12px Inter, system-ui, sans-serif';
      context.textAlign = 'center';
      context.fillText(String(observation.bounds.xMin), left, top + size + 22);
      context.fillText(String(observation.bounds.xMax), left + size, top + size + 22);
      context.fillText('X (mm)', left + size / 2, top + size + 38);
      context.save();
      context.translate(left - 30, top + size / 2);
      context.rotate(-Math.PI / 2);
      context.fillText('Y (mm)', 0, 0);
      context.restore();
      context.textAlign = 'right';
      context.fillText(String(observation.bounds.yMax), left - 8, top + 4);
      context.fillText(String(observation.bounds.yMin), left - 8, top + size);
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  });
</script>

<canvas bind:this={canvas} data-bed-mesh-2d aria-hidden="true"></canvas>
