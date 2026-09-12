import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createBedMeshController } from '../../lib/client/live/bed-mesh-controller';
import LiveBedMeshRoot from '../../components/live/LiveBedMeshRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createBedMeshController(observationPort(createHostRpc(window), 'bed_mesh'));
const component = mount(LiveBedMeshRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
