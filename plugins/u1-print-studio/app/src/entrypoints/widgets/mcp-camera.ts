import { mount, unmount } from 'svelte';
import LiveCameraRoot from '../../components/camera/LiveCameraRoot.svelte';
import '../../components/common/tokens.css';
import '../../components/common/host.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const component = mount(LiveCameraRoot, { target, props: { initialSnapshot: 'host-result', presentation: 'host' } });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) void unmount(component);
});
