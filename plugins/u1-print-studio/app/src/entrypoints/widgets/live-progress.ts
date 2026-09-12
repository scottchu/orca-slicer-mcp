import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createProgressController } from '../../lib/client/live/focused-controllers';
import LiveProgressRoot from '../../components/live/LiveProgressRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createProgressController(observationPort(createHostRpc(window), 'progress'));
const component = mount(LiveProgressRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});

