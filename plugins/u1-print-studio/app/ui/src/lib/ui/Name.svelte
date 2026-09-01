<script lang="ts">
  let { text }: { text: string } = $props();
</script>

<span class="name" data-required-text>{text}</span>

<style>
  .name { min-width: 0; color: var(--u1-ink); font-size: var(--u1-type-name); font-weight: var(--u1-weight-name); line-height: var(--u1-line-copy); }
</style>
