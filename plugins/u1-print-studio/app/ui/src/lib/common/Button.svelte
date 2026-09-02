<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  type Glyph = typeof import('lucide-svelte')['Box'];
  let { label, icon, children, variant = 'default', pressed, onclick, disabled = false, busy = false }: {
    label: string; icon?: Glyph; children?: Snippet; variant?: 'default' | 'quiet'; pressed?: boolean;
    onclick?: () => void; disabled?: boolean; busy?: boolean;
  } = $props();
  let button: HTMLButtonElement;
  // Only callers with a focus-recovery policy install this short-lived lease.
  export const captureFocus = () => {
    const target = button;
    const document = target?.ownerDocument;
    if (!document?.hasFocus() || document.activeElement !== target) return undefined;
    let current = true;
    const lost = () => { current = false; };
    target.addEventListener('blur', lost);
    document.defaultView?.addEventListener('blur', lost);
    return {
      ownsFocus: () => current && document.hasFocus() && document.activeElement === target,
      release: () => { target.removeEventListener('blur', lost); document.defaultView?.removeEventListener('blur', lost); }
    };
  };
  export const canRecoverFocus = () => {
    const document = button?.ownerDocument;
    return !!document?.hasFocus() && (document.activeElement === button || document.activeElement === document.body);
  };
</script>

<button bind:this={button} type="button" class:quiet={variant === 'quiet'} class:content={!!children} aria-label={label} title={label} aria-pressed={pressed} aria-disabled={busy || undefined} {disabled} onclick={() => { if (!disabled && !busy) onclick?.(); }}>
  {@render children?.()}
  {#if icon}<Icon {icon} size={variant === 'quiet' ? 16 : 20} />{/if}
</button>

<style>
  button { display: inline-grid; place-items: center; width: var(--u1-action-size); min-width: var(--u1-action-size); height: var(--u1-action-size); min-height: var(--u1-action-size); padding: 0; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); color: var(--u1-ink); background: var(--u1-soft); cursor: pointer; touch-action: manipulation; }
  button:hover { border-color: #cfd3d8; background: #eef1f3; }
  button[aria-pressed="true"] { border-color: #8b929a; background: #e8edf1; box-shadow: inset 0 0 0 1px #8b929a; }
  .content { width: auto; grid-auto-flow: column; gap: var(--u1-space-1); padding-inline: 12px; }
  .quiet { border: 0; color: var(--u1-muted); background: transparent; }
  .quiet:hover { color: var(--u1-ink); background: var(--u1-soft); }
  /* Borrow the existing card inset while preserving whole-hex content width. */
  .quiet.content { box-sizing: border-box; width: calc(100% + 16px); margin-inline: -8px; padding-inline: 8px; grid-template-columns: minmax(0, 1fr) 16px; text-align: left; }
  .quiet.content :global(> :first-child) { justify-self: start; }
  button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  button:disabled, button[aria-disabled="true"] { cursor: default; opacity: .45; }
</style>
