import type { HostDisplayMode, HostRpc } from '../host/rpc';

export type PresentationState = {
  mode: HostDisplayMode;
  pending: boolean;
  surface: 'host' | 'document';
};
export type Presentation = {
  subscribe: (listener: (state: PresentationState) => void) => () => void;
  toggle: () => Promise<boolean>;
  dispose: () => void;
};
export type PresentationFactory = (surface: HTMLElement) => Presentation;

type PresentationAdapter = {
  surface: PresentationState['surface'];
  observe: (listener: (mode: HostDisplayMode) => void) => () => void;
  request: (mode: 'inline' | 'fullscreen') => Promise<HostDisplayMode>;
};

/** Presentation requests do not acquire, pause, replace, or dispose media. */
const createPresentation = (adapter: PresentationAdapter): Presentation => {
  let state: PresentationState = { mode: 'inline', pending: false, surface: adapter.surface };
  let disposed = false;
  let revision = 0;
  const listeners = new Set<(state: PresentationState) => void>();
  const publish = (patch: Partial<PresentationState>) => {
    if (disposed) return;
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state);
  };
  const unobserve = adapter.observe((mode) => {
    if (disposed) return;
    revision++;
    publish({ mode });
  });
  return {
    subscribe: (listener) => {
      if (disposed) return () => {};
      listeners.add(listener);
      listener(state);
      return () => { listeners.delete(listener); };
    },
    toggle: async () => {
      if (disposed || state.pending) return true;
      const requested = state.mode === 'fullscreen' ? 'inline' : 'fullscreen';
      const requestRevision = revision;
      publish({ pending: true });
      try {
        const actual = await adapter.request(requested);
        if (disposed) return true;
        // A newer host/native transition, including user Exit, owns presentation.
        if (revision === requestRevision) publish({ mode: actual });
        return state.mode === requested;
      } catch {
        return disposed;
      } finally {
        publish({ pending: false });
      }
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      unobserve();
      listeners.clear();
    },
  };
};

export const createHostPresentation = (
  host: Pick<HostRpc, 'start' | 'requestDisplayMode' | 'subscribeContext'>,
): Presentation => {
  let available: HostDisplayMode[] | undefined;
  return createPresentation({
    surface: 'host',
    observe: (listener) => host.subscribeContext((context, patch) => {
      if (Array.isArray(context.availableDisplayModes)) {
        available = context.availableDisplayModes.filter((mode): mode is HostDisplayMode =>
          mode === 'inline' || mode === 'fullscreen' || mode === 'pip',
        );
      }
      const mode = patch.displayMode;
      if (mode === 'inline' || mode === 'fullscreen' || mode === 'pip') listener(mode);
    }),
    request: async (mode) => {
      await host.start();
      // Exit is always available even when the host omits inline in capabilities.
      if (mode === 'fullscreen' && available && !available.includes(mode)) {
        throw new Error('Fullscreen unavailable');
      }
      return host.requestDisplayMode(mode);
    },
  });
};

export const createDocumentPresentation = (
  surface: HTMLElement,
  document: Document,
  canEnter: () => boolean = () => true,
): Presentation => createPresentation({
  surface: 'document',
  observe: (listener) => {
    const update = () => listener(document.fullscreenElement === surface ? 'fullscreen' : 'inline');
    document.addEventListener('fullscreenchange', update);
    update();
    return () => document.removeEventListener('fullscreenchange', update);
  },
  request: async (mode) => {
    if (mode === 'inline') await document.exitFullscreen();
    else if (canEnter() && document.fullscreenEnabled && typeof surface.requestFullscreen === 'function') {
      await surface.requestFullscreen();
    } else throw new Error('Fullscreen unavailable');
    return document.fullscreenElement === surface ? 'fullscreen' : 'inline';
  },
});
