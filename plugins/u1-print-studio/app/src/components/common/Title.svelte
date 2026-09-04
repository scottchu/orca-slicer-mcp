<script lang="ts">
  let { text, size = 'large' }: { text: string; size?: 'medium' | 'large' } = $props();
</script>
<h2 class:medium={size === 'medium'} data-node-kind="Title">{text}</h2>
<style>
  h2 { margin: 0; padding: var(--u1-composed-y, var(--u1-space-4)) var(--u1-composed-x, var(--u1-card-x)) 0; font-size: 1.375rem; font-weight: var(--u1-weight-strong); line-height: 1.2; letter-spacing: -0.025em; }
  h2.medium { font-size: 1.125rem; }
</style>
