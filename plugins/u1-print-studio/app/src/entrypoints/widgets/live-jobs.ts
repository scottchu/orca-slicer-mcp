import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createJobsController } from '../../lib/client/live/focused-controllers';
import LiveJobsRoot from '../../components/live/LiveJobsRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createJobsController(observationPort(createHostRpc(window), 'jobs'));
const component = mount(LiveJobsRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});

