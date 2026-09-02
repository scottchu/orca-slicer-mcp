<script lang="ts">
  type LucideIcon = typeof import('lucide-svelte')['Box'];
  let { label, icon, pressed, onclick, disabled = false, busy = false }: { label: string; icon: LucideIcon; pressed?: boolean; onclick?: () => void; disabled?: boolean; busy?: boolean } = $props();
  const Icon = $derived(icon);
  let button: HTMLButtonElement;
  // A short-lived lease lets a caller distinguish user focus loss from its own
  // later disabled-state patch. Only explicit callers install these listeners.
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

<button bind:this={button} type="button" class="icon-button" aria-label={label} title={label} aria-pressed={pressed} aria-disabled={busy || undefined} {disabled} onclick={() => { if (!disabled && !busy) onclick?.(); }}>
  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
</button>

<style>
  .icon-button { display: inline-grid; place-items: center; width: var(--u1-action-size); min-width: var(--u1-action-size); height: var(--u1-action-size); min-height: var(--u1-action-size); padding: 0; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); color: var(--u1-ink); background: var(--u1-soft); cursor: pointer; touch-action: manipulation; }
  .icon-button:hover { border-color: #cfd3d8; background: #eef1f3; }
  .icon-button[aria-pressed="true"] { border-color: #8b929a; background: #e8edf1; box-shadow: inset 0 0 0 1px #8b929a; }
  .icon-button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  .icon-button:disabled, .icon-button[aria-disabled="true"] { cursor: default; opacity: 0.45; }
</style>
