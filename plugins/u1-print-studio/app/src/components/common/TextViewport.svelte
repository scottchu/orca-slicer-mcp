<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { ArrowLeftRight } from 'lucide-svelte';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';

  const descriptionId = $props.id();
  let { label, text, loading = false }: { label: string; text?: string; loading?: boolean } = $props();
  const value = $derived.by(() => {
    if (loading && text !== undefined) throw new Error('Loading text viewport cannot carry a value');
    if (text !== undefined && typeof text !== 'string') throw new Error('Invalid text viewport value');
    return text ?? '';
  });
  const populated = $derived(!loading && value.length > 0);
  let viewport: HTMLDivElement;
  let content: HTMLSpanElement;
  let overflowing = $state(false);
  let disposed = false;
  const measure = () => {
    if (!disposed && viewport) overflowing = populated && viewport.scrollWidth > viewport.clientWidth + 1;
  };
  onMount(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(content);
    measure();
    return () => { disposed = true; observer.disconnect(); };
  });
  $effect(() => {
    value; loading;
    if (viewport) viewport.scrollLeft = 0;
    void tick().then(measure);
  });
  const onkeydown = (event: KeyboardEvent) => {
    if (!overflowing || !populated) return;
    const step = Math.max(40, viewport.clientWidth * 0.75);
    const next = event.key === 'ArrowRight' ? viewport.scrollLeft + step
      : event.key === 'ArrowLeft' ? viewport.scrollLeft - step
      : event.key === 'Home' ? 0 : event.key === 'End' ? viewport.scrollWidth : null;
    if (next === null) return;
    event.preventDefault();
    viewport.scrollLeft = next;
  };
</script>

<div class="text-viewport" data-text-viewport>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Overflowing read-only text needs keyboard scrolling; fitting text is removed from the tab order.) -->
  <div bind:this={viewport} class="scroll" role={overflowing && populated ? 'region' : undefined}
    aria-label={overflowing && populated ? label : undefined}
    aria-describedby={overflowing && populated ? descriptionId : undefined}
    aria-hidden={!populated} inert={!populated} tabindex={overflowing && populated ? 0 : -1}
    data-text-scroll {onkeydown}>
    <span bind:this={content} class="content">{#if loading}<Skeleton shape="caption" />{:else}{value}{/if}</span>
  </div>
  <span class="cue" class:quiet={!overflowing || !populated} aria-hidden="true"><Icon icon={ArrowLeftRight} size={16} /></span>
</div>
<span id={descriptionId} hidden>Scroll horizontally to read the full text. Arrow keys, Home and End scroll this region.</span>

<style>
  .text-viewport { display: flex; align-items: center; gap: 8px; min-width: 0; block-size: max(44px, 1lh); color: var(--u1-muted); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); }
  .scroll { flex: 1 1 auto; min-width: 0; block-size: 100%; display: flex; align-items: center; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; overscroll-behavior-x: contain; }
  .scroll::-webkit-scrollbar { display: none; }
  .scroll:focus-visible { outline: 2px solid var(--u1-ink); outline-offset: -2px; border-radius: var(--u1-radius-control); }
  .content { flex: none; display: block; white-space: nowrap; }
  .cue { flex: none; display: grid; place-items: center; width: 16px; }
  .quiet { visibility: hidden; }
</style>
