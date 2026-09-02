import { mount, unmount } from 'svelte';
import { createHostRpc } from '../../lib/client/host/rpc';
import { observationPort } from '../../lib/client/live/observation-port';
import { createHeadsController } from '../../lib/client/live/heads-controller';
import LiveHeadsRoot from '../../components/live/LiveHeadsRoot.svelte';
import '../../components/common/tokens.css';
const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const controller = createHeadsController(observationPort(createHostRpc(window), 'heads'), (text) => navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('Clipboard unavailable')));
const component = mount(LiveHeadsRoot, { target, props: { controller } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { controller.dispose(); void unmount(component); }
});
