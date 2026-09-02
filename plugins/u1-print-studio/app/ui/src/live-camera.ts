import { mount, unmount } from 'svelte';
import LiveCameraRoot from './lib/camera/LiveCameraRoot.svelte';
import './lib/common/tokens.css';

const target = document.getElementById('widget-root');
if (!target) throw new Error('Missing widget root');
const component = mount(LiveCameraRoot, { target });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) void unmount(component);
});
