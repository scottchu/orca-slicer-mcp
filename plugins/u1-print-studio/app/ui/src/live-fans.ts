import { mount, unmount } from 'svelte';
import { createHostRpc } from './lib/host/rpc';
import { observationPort } from './lib/live/observation-port';
import { createFansController } from './lib/live/controller';
import LiveObservationRoot from './lib/live/LiveObservationRoot.svelte';
import './lib/ui/tokens.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createFansController(observationPort(createHostRpc(window), 'fans'));
const component = mount(LiveObservationRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  // A persisted document keeps its mounted root/bridge for BFCache restoration.
  // Reinitializing on pageshow would duplicate the host acquisition and listeners.
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
