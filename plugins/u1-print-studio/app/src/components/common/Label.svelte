<script lang="ts">
  let { text, tone = 'default' }: { text: string; tone?: 'default' | 'muted' | 'positive' } = $props();
</script>

<span class="label" class:muted={tone === 'muted'} class:positive={tone === 'positive'}>{text}</span>

<style>
  .label { color: var(--u1-ink); font-size: var(--u1-type-label); line-height: var(--u1-line-copy); }
  .muted { color: var(--u1-muted); }
  .positive { color: var(--u1-positive); }
</style>
