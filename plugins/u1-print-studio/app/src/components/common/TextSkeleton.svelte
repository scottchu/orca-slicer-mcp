<script lang="ts">
  let { shape }: { shape: string } = $props();
  const template = $derived.by(() => {
    if (typeof shape !== 'string' || !shape.length || [...shape].length > 320 || /[\u0000-\u001f\u007f-\u009f]/u.test(shape)) throw new Error('Invalid text structure');
    return shape;
  });
</script>
<span class="text-skeleton" data-loading-value data-text-skeleton aria-hidden="true">{template}</span>
<style>
  .text-skeleton { color: transparent; background: var(--u1-skeleton-base); border-radius: var(--u1-skeleton-radius); user-select: none; pointer-events: none; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
</style>
