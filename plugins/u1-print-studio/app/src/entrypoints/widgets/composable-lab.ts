import { mount, unmount } from 'svelte';
import ComposableMcpRoot from '../../components/composable/ComposableMcpRoot.svelte';
import { createWidgetHost } from '../../lib/client/host/widget';
import '../../components/common/tokens.css';
import '../../components/common/host.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const component = mount(ComposableMcpRoot, { target, props: { rpc: createWidgetHost() } });
window.addEventListener('pagehide', (event) => { if (!event.persisted) void unmount(component); });
