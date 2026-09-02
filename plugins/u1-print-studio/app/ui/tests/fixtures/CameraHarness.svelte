<script lang="ts">
  import CameraLabWidget from '../../src/lib/camera/CameraLabWidget.svelte';
  import type { CameraScenario, CameraCapabilityPolicy } from '../../src/lib/camera/state';
  import '../../src/lib/common/tokens.css';
  let scenario = $state<CameraScenario>('snapshot');
  let capabilityPolicy = $state<CameraCapabilityPolicy>('native');
  let visible = $state(true);
  (window as unknown as { __setCamera: (next: CameraScenario, policy?: CameraCapabilityPolicy) => void }).__setCamera = (next, policy = 'native') => {
    scenario = next; capabilityPolicy = policy;
  };
  (window as unknown as { __hideCamera: () => void }).__hideCamera = () => { visible = false; };
</script>
<main>{#if visible}<CameraLabWidget {scenario} {capabilityPolicy} />{/if}</main>
<style>main { max-width: 720px; margin: 12px auto; padding: 0 12px; }</style>
