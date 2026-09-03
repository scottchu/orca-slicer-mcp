import { createDocumentPresentation, createHostPresentation, type PresentationFactory } from '../media/presentation';
import { createWidgetHost } from '../host/widget';
import type { VideoSurfacePort } from '../media/playback';
import { createCameraPeer } from './peer';
import { createLiveCameraController } from './live-controller';

/** The only browser/host edge. No printer URL, fetch or synthetic producer. */
export const createBrowserCamera = (surface: VideoSurfacePort, initialSnapshot: 'request' | 'host-result' = 'request', presentationSurface: 'host' | 'document' = 'document') => {
  const rpc = createWidgetHost();
  const presentation: PresentationFactory = (element) => presentationSurface === 'host'
    ? createHostPresentation(rpc)
    : createDocumentPresentation(element, document);
  let cancelDecode: (() => void) | null = null;
  const controller = createLiveCameraController({
    initialSnapshot,
    rpc,
    scheduler: { now: () => performance.now(), timestamp: () => new Date().toISOString(), after: (milliseconds, callback) => {
      const timer = setTimeout(callback, milliseconds); return () => clearTimeout(timer);
    } },
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
  return { ...controller, presentation, dispose: () => {
    window.removeEventListener('pagehide', hide); window.removeEventListener('pageshow', show);
    cancelDecode?.(); controller.dispose();
  } };
};
