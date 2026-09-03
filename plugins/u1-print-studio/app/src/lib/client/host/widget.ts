import { createHostRpc } from './rpc';

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

/** Host allocation is separate from Camera/observation state and connections. */
export const createWidgetHost = () => {
  let disposed = false;
  let ready = false;
  let fullscreen = false;
  let frame = 0;
  let previous = '';
  const root = document.getElementById('widget-root') ?? document.body;
  const report = () => {
    frame = 0;
    if (disposed || !ready || fullscreen) return;
    const bottomMargin = Number.parseFloat(getComputedStyle(root).marginBottom || '0');
    const height = Math.ceil(root.getBoundingClientRect().bottom + window.scrollY + bottomMargin);
    const width = document.documentElement.clientWidth;
    const identity = `${width}:${height}`;
    if (height <= 0 || identity === previous) return;
    previous = identity;
    window.parent.postMessage(
      {
        jsonrpc: '2.0',
        method: 'ui/notifications/size-changed',
        params: { height, width },
      },
      '*',
    );
  };
  const schedule = () => {
    if (!disposed && ready && !fullscreen && !frame) frame = requestAnimationFrame(report);
  };
  const rpc = createHostRpc(window, {
    onInitialized: () => {
      ready = true;
      previous = '';
      schedule();
    },
    onHostContext: (context) => {
      const safeArea = record(record(context)?.safeArea);
      const insets = record(safeArea?.insets) ?? safeArea;
      for (const side of ['top', 'right', 'bottom', 'left']) {
        const value = insets?.[side];
        if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
          root.style.setProperty(`--u1-host-inset-${side}`, `${value}px`);
        }
      }
      const nextFullscreen = record(context)?.displayMode === 'fullscreen';
      if (fullscreen && !nextFullscreen) previous = '';
      fullscreen = nextFullscreen;
      // The host owns fullscreen allocation. Resume intrinsic sizing only after
      // returning inline and letting the component remove its fullscreen style.
      schedule();
    },
  });
  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  window.addEventListener('resize', schedule);
  return {
    ...rpc,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      rpc.dispose();
    },
  };
};
