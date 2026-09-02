import { mount, unmount } from 'svelte';
import { createHostRpc } from './lib/host/rpc';
import { observationPort } from './lib/live/observation-port';
import { createQueueController } from './lib/live/queue-controller';
import LiveQueueRoot from './lib/live/LiveQueueRoot.svelte';
import './lib/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createQueueController(observationPort(createHostRpc(window), 'queue'));
const component = mount(LiveQueueRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
