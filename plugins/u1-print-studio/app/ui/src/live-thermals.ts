import { mount, unmount } from 'svelte';
import { createHostRpc } from './lib/host/rpc';
import { observationPort } from './lib/live/observation-port';
import { createThermalsController } from './lib/live/thermals-controller';
import LiveThermalsRoot from './lib/live/LiveThermalsRoot.svelte';
import './lib/ui/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createThermalsController(observationPort(createHostRpc(window), 'thermals'));
const component = mount(LiveThermalsRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
