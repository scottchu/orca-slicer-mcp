<script lang="ts" generics="Value extends string">
  import { validateIconSegmented, type IconSegmentedProps } from './icon-segmented';
  let props: IconSegmentedProps<Value> = $props();
  const control = $derived(validateIconSegmented(props));
  let buttons = $state<HTMLButtonElement[]>([]);
  export const focusSelected = () => {
    if (control.loading || control.disabled) return;
    buttons[control.options.findIndex(({ value }) => value === control.value)]?.focus({ preventScroll: true });
  };
  const choose = (index: number, focus = false) => {
    if (control.loading || control.disabled) return;
    if (focus) buttons[index]?.focus();
    const next = control.options[index].value;
    if (next !== control.value) control.onchange(next);
  };
  const keydown = (event: KeyboardEvent, index: number) => {
    if (control.loading || control.disabled) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1
      : ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) ? 1 - index
      : event.key === ' ' || event.key === 'Enter' ? index : null;
    if (next === null) return;
    event.preventDefault();
    if (!event.repeat || event.key.startsWith('Arrow')) choose(next, true);
  };
</script>

<div class="segments" class:disabled={!control.loading && control.disabled} data-icon-segmented data-loading={control.loading || undefined} role={control.loading ? undefined : 'radiogroup'} aria-label={control.loading ? undefined : control.label} aria-hidden={control.loading || undefined} aria-disabled={!control.loading && control.disabled || undefined}>
  <span class="track" aria-hidden="true">
    {#if !control.loading}<span class="thumb" class:second={control.value === control.options[1].value}></span>{/if}
  </span>
  {#if !control.loading}
    {#each control.options as option, index (option.value)}
      {@const Glyph = option.icon}
      <button bind:this={buttons[index]} type="button" role="radio" aria-label={option.label} aria-checked={control.value === option.value} tabindex={!control.disabled && control.value === option.value ? 0 : -1} disabled={control.disabled} onclick={() => choose(index)} onkeydown={(event) => keydown(event, index)}>
        <Glyph size={20} strokeWidth={1.8} aria-hidden="true" />
      </button>
    {/each}
  {/if}
</div>

<style>
  .segments { position: relative; display: inline-flex; flex: 0 0 88px; width: 88px; height: 44px; vertical-align: middle; isolation: isolate; }
  .track { position: absolute; left: 0; top: 6px; width: 88px; height: 32px; border-radius: var(--u1-radius-control); background: var(--u1-soft); box-shadow: inset 0 0 0 1px var(--u1-line); pointer-events: none; }
  .thumb { position: absolute; left: 2px; top: 2px; width: 40px; height: 28px; border-radius: calc(var(--u1-radius-control) - 2px); background: var(--u1-surface); box-shadow: 0 1px 3px rgba(28, 30, 32, .12); transform: translateX(0); transition: transform 180ms ease; }
  .thumb.second { transform: translateX(44px); }
  button { position: relative; display: inline-grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px; padding: 0; border: 0; border-radius: var(--u1-radius-control); background: transparent; color: var(--u1-muted); cursor: pointer; touch-action: manipulation; }
  button[aria-checked='true'] { color: var(--u1-ink); }
  button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  .disabled { opacity: .45; }
  button:disabled { cursor: default; }
  [data-loading] .track { background: var(--u1-skeleton-base); }
  @media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }
  @media (forced-colors: active) { .track { outline: 1px solid CanvasText; } .thumb { outline: 1px solid Highlight; } }
</style>
