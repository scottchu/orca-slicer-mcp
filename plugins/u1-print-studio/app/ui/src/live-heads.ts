import { mount, unmount } from 'svelte';
import { createHostRpc } from './lib/host/rpc';
import { observationPort } from './lib/live/observation-port';
import { createHeadsController } from './lib/live/heads-controller';
import LiveHeadsRoot from './lib/live/LiveHeadsRoot.svelte';
import './lib/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createHeadsController(observationPort(createHostRpc(window), 'heads'), (text) => navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('Clipboard unavailable')));
const component = mount(LiveHeadsRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
