import { mount, unmount } from 'svelte';
import LiveCurrentJobRoot from './lib/live/LiveCurrentJobRoot.svelte';
import { createCurrentJobController } from './lib/live/current-job-controller';
import { createHostRpc } from './lib/host/rpc';
import { observationPort } from './lib/live/observation-port';
import './lib/ui/tokens.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const rpc = createHostRpc(window);
const controller = createCurrentJobController(observationPort(rpc, 'jobs'));
const app = mount(LiveCurrentJobRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  controller.dispose();
  void unmount(app);
});
