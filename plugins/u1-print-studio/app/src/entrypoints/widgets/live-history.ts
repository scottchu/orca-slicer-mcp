import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createHistoryController } from '../../lib/client/live/focused-controllers';
import LiveHistoryRoot from '../../components/live/LiveHistoryRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createHistoryController(observationPort(createHostRpc(window), 'job_history'));
const component = mount(LiveHistoryRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});

