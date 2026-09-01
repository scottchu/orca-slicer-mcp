<script lang="ts">
  import { RotateCcw } from 'lucide-svelte';
  import IconButton from './IconButton.svelte';
  type Option = { value: string; label: string };
  type Field = { key: string; label: string; options: readonly Option[]; disabled?: boolean };
  let { fields, values, onchange, onreset }: {
    fields: readonly Field[]; values: Readonly<Record<string, string>>;
    onchange: (key: string, value: string) => void; onreset: () => void;
  } = $props();
</script>

<fieldset class="lab-controls" data-lab-controls>
  <legend>Lab preview · synthetic data</legend>
  <div class="fields">
    {#each fields as field (field.key)}
      <label>
        <span>{field.label}</span>
        <select aria-label={field.label} disabled={field.disabled} value={values[field.key]} onchange={(event) => onchange(field.key, event.currentTarget.value)}>
          {#each field.options as option (option.value)}<option value={option.value}>{option.label}</option>{/each}
        </select>
      </label>
    {/each}
    <IconButton label="Reset lab preview" icon={RotateCcw} onclick={onreset} />
  </div>
</fieldset>

<style>
  .lab-controls { min-width: 0; margin: 16px 0 0; padding: 12px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-inner); background: var(--u1-canvas); }
  legend { padding: 0 5px; color: var(--u1-muted); font-size: 12px; }
  .fields { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }
  label { display: flex; flex: 1 1 130px; flex-direction: column; min-width: 0; gap: 4px; }
  label > span { color: var(--u1-muted); font-size: 12px; }
  select { box-sizing: border-box; width: 100%; min-width: 0; min-height: 44px; padding: 8px; border: 1px solid var(--u1-line); border-radius: var(--u1-radius-control); color: var(--u1-ink); background: var(--u1-surface); font: inherit; font-size: 13px; }
  select:focus-visible { outline: 3px solid var(--u1-focus); outline-offset: 2px; }
  select:disabled { opacity: .5; }
</style>
