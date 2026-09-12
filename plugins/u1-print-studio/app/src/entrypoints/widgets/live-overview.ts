import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createOverviewController } from '../../lib/client/live/focused-controllers';
import LiveOverviewRoot from '../../components/live/LiveOverviewRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createOverviewController(observationPort(createHostRpc(window), 'overview'));
const component = mount(LiveOverviewRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});

