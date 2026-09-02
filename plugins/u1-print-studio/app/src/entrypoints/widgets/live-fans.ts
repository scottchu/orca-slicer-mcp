import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createFansController } from '../../lib/client/live/controller';
import LiveObservationRoot from '../../components/live/LiveObservationRoot.svelte';
import '../../components/common/tokens.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createFansController(observationPort(createHostRpc(window), 'fans'));
const component = mount(LiveObservationRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  // A persisted document keeps its mounted root/bridge for BFCache restoration.
  // Reinitializing on pageshow would duplicate the host acquisition and listeners.
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
