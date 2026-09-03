import { mount, unmount } from 'svelte';
import { createWidgetHost } from '../../lib/client/host/widget';
import ObservationRoot from '../../components/mcp/ObservationRoot.svelte';
import '../../components/common/tokens.css';
import '../../components/common/host.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const component = mount(ObservationRoot, { target, props: { rpc: createWidgetHost() } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) void unmount(component);
});
