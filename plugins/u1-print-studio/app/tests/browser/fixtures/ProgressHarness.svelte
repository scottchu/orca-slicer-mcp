<script lang="ts">
  import ProgressWidget from '../../../src/components/observation/ProgressWidget.svelte';
  import { progressLabFixture } from '../../../src/lib/client/fixtures/observations';
  import '../../../src/components/common/tokens.css';
  let loading = $state(false);
  Object.assign(window, { __progressLoading: () => { loading = true; } });
</script>
<main>{#if loading}<ProgressWidget loading />{:else}<ProgressWidget observation={{ ...progressLabFixture, percent: 4, currentLayer: 26 }} />{/if}</main>
<style>
  main { width: min(100% - 24px, 720px); margin: 24px auto; }
  @media (min-width: 590px) { main { width: min(100% - 40px, 720px); margin-block: 40px; } }
</style>
