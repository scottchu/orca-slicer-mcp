import { createHostRpc } from '../host/rpc';
import type { VideoSurfacePort } from '../media/playback';
import { createCameraPeer } from './peer';
import { createLiveCameraController } from './live-controller';

type CameraCompatibility = { widgetState?: unknown; setWidgetState?: (state: unknown) => unknown };
const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

/** The only browser/host edge. No printer URL, fetch or synthetic producer. */
export const createBrowserCamera = (surface: VideoSurfacePort) => {
  const host = window as Window & { openai?: CameraCompatibility };
  let cancelDecode: (() => void) | null = null;
  const controller = createLiveCameraController({
    rpc: createHostRpc(window),
    scheduler: { now: () => performance.now(), timestamp: () => new Date().toISOString(), after: (milliseconds, callback) => {
      const timer = setTimeout(callback, milliseconds); return () => clearTimeout(timer);
    } },
    savedLiveIntent: () => record(record(host.openai?.widgetState)?.u1Camera)?.liveRequested === true,
    persistLiveIntent: (liveRequested) => {
      try {
        const previous = record(host.openai?.widgetState) ?? {};
        void Promise.resolve(host.openai?.setWidgetState?.({ ...previous, u1Camera: { liveRequested } })).catch(() => {});
      } catch { /* Host persistence is optional; it never authorizes this session. */ }
    },
    decode: (snapshot) => {
      cancelDecode?.();
      return new Promise<boolean>((resolve) => {
        const image = new Image(); let settled = false;
        const finish = (loaded: boolean) => {
          if (settled) return;
          settled = true; image.onload = null; image.onerror = null; clearTimeout(timer);
          if (cancelDecode === cancel) cancelDecode = null;
          if (!loaded) image.removeAttribute('src');
          resolve(loaded);
        };
        const cancel = () => finish(false);
        const timer = setTimeout(cancel, 1500);
        cancelDecode = cancel;
        image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
        image.onerror = cancel;
        image.src = snapshot.image;
      });
    },
    peer: (offer, events) => createCameraPeer(offer, events, {
      connection: (configuration) => new RTCPeerConnection(configuration),
      stream: (tracks) => new MediaStream(tracks), surface,
    }),
  });
  const hide = () => { cancelDecode?.(); controller.pageHide(); };
  const show = () => { void controller.pageShow(); };
  window.addEventListener('pagehide', hide);
  window.addEventListener('pageshow', show);
  return { ...controller, dispose: () => {
    window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
    cancelDecode?.(); controller.dispose();
  } };
};
