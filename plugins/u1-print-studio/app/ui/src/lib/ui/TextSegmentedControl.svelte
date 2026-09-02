<script lang="ts" generics="Value extends string">
  let { label, options, value, onchange }: {
    label: string; options: readonly { value: Value; label: string }[]; value: Value; onchange: (value: Value) => void;
  } = $props();
  const choose = (index: number, event?: KeyboardEvent) => {
    if (event) (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')[index]?.focus({ preventScroll: true });
    if (options[index].value !== value) onchange(options[index].value);
  };
  const keydown = (event: KeyboardEvent, index: number) => {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (index + options.length - 1) % options.length
      : ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % options.length
      : [' ', 'Enter'].includes(event.key) ? index : null;
    if (next === null) return;
    event.preventDefault();
    if (!event.repeat || event.key.startsWith('Arrow')) choose(next, event);
  };
</script>

<div class="segments" data-text-segmented role="radiogroup" aria-label={label} style={`--segments:${options.length}`}>
  {#each options as option, index (option.value)}
    <button type="button" role="radio" aria-checked={value === option.value} tabindex={value === option.value ? 0 : -1} onclick={() => choose(index)} onkeydown={(event) => keydown(event, index)}>{option.label}</button>
  {/each}
</div>

<style>
  .segments { display: grid; grid-template-columns: repeat(var(--segments), minmax(max-content, 1fr)); gap: 2px; width: 100%; min-width: 0; border-radius: var(--u1-radius-control); background: var(--u1-soft); }
  button { min-width: 44px; min-height: 44px; padding: 4px 8px; border: 0; border-radius: var(--u1-radius-control); background: transparent; color: var(--u1-muted); font: inherit; font-size: 12px; font-weight: 550; line-height: 1.3; cursor: pointer; touch-action: manipulation; }
  button[aria-checked='true'] { background: var(--u1-surface); color: var(--u1-ink); box-shadow: inset 0 0 0 1px var(--u1-line); }
  button:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  @media (forced-colors: active) { button[aria-checked='true'] { outline: 1px solid Highlight; } }
</style>
