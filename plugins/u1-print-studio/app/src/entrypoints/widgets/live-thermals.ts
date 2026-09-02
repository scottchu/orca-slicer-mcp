import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createThermalsController } from '../../lib/client/live/thermals-controller';
import LiveThermalsRoot from '../../components/live/LiveThermalsRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createThermalsController(observationPort(createHostRpc(window), 'thermals'));
const component = mount(LiveThermalsRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
