<script lang="ts" generics="Value extends string">
  import { validateSwitch, type SwitchProps } from '../../lib/client/common/switch';
  import Icon from './Icon.svelte';
  let props: SwitchProps<Value> = $props();
  const control = $derived(validateSwitch(props));
  let group: HTMLDivElement;
  const focus = (index: number) => group.querySelectorAll('button')[index]?.focus({ preventScroll: true });
  export const focusSelected = () => {
    if (control.loading || control.disabled) return;
    focus(control.options.findIndex(({ value }) => value === control.value));
  };
  const choose = (index: number, moveFocus = false) => {
    if (control.loading || control.disabled) return;
    if (moveFocus) focus(index);
    const next = control.options[index].value;
    if (next !== control.value) control.onchange(next);
  };
  const keydown = (event: KeyboardEvent, index: number) => {
    if (control.loading || control.disabled) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? control.options.length - 1
      : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (index + control.options.length - 1) % control.options.length
      : ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % control.options.length
      : event.key === ' ' || event.key === 'Enter' ? index : null;
    if (next === null) return;
    event.preventDefault();
    if (!event.repeat || event.key.startsWith('Arrow')) choose(next, true);
  };
</script>

<div bind:this={group} class="segments" style={`--segments:${control.options.length};--selected:${control.options.findIndex(option => option.value === control.value)}`} class:disabled={!control.loading && control.disabled} data-icon-segmented data-loading={control.loading || undefined} role={control.loading ? undefined : 'radiogroup'} aria-label={control.loading ? undefined : control.label} aria-hidden={control.loading || undefined} aria-disabled={!control.loading && control.disabled || undefined}>
  <span class="track" aria-hidden="true">
    {#if !control.loading}<span class="thumb"></span>{/if}
  </span>
  {#if !control.loading}
    {#each control.options as option, index (option.value)}
      <button type="button" role="radio" aria-label={option.label} title={option.label} aria-checked={control.value === option.value} tabindex={!control.disabled && control.value === option.value ? 0 : -1} disabled={control.disabled} onclick={() => choose(index)} onkeydown={(event) => keydown(event, index)}>
        <Icon icon={option.icon} />
      </button>
    {/each}
  {/if}
</div>

<style>
  .segments { position: relative; display: inline-flex; flex: 0 0 calc(var(--segments) * var(--u1-action-size)); width: calc(var(--segments) * var(--u1-action-size)); height: var(--u1-action-size); vertical-align: middle; isolation: isolate; }
  .track { position: absolute; inset: 0; border-radius: var(--u1-radius-control); background: var(--u1-soft); box-shadow: inset 0 0 0 1px var(--u1-line); pointer-events: none; }
  .thumb { position: absolute; left: 2px; top: 2px; width: calc(var(--u1-action-size) - 4px); height: calc(var(--u1-action-size) - 4px); border-radius: calc(var(--u1-radius-control) - 2px); background: var(--u1-surface); box-shadow: 0 1px 3px rgba(28, 30, 32, .12); transform: translateX(calc(var(--selected) * var(--u1-action-size))); transition: transform 180ms ease; }
  button { position: relative; display: inline-grid; place-items: center; flex: 0 0 var(--u1-action-size); width: var(--u1-action-size); height: var(--u1-action-size); padding: 0; border: 0; border-radius: var(--u1-radius-control); background: transparent; color: var(--u1-muted); cursor: pointer; touch-action: manipulation; }
  button[aria-checked='true'] { color: var(--u1-ink); }
  button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  .disabled { opacity: .45; }
  button:disabled { cursor: default; }
  [data-loading] .track { background: var(--u1-skeleton-base); }
  @media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }
  @media (forced-colors: active) { .track { outline: 1px solid CanvasText; } .thumb { outline: 1px solid Highlight; } }
</style>
