import type { HostRpc } from '../host/rpc';
import { createCameraSession, type CameraSessionPorts, type CameraSessionState } from './session';
import { cameraTransport, parseCameraFrame } from './transport';

export type LiveCameraState = { camera: CameraSessionState; feedback: string };
export type LiveCameraPorts = Omit<CameraSessionPorts, 'changed' | 'transport'> & {
  rpc: HostRpc; savedLiveIntent: () => boolean;
};

/** One mounted real-camera orchestration owner, independent of DOM and fixtures. */
export const createLiveCameraController = (ports: LiveCameraPorts) => {
  let disposed = false, started = false, hidden = false, generation = 0, notificationVersion = 0, feedbackOwner = 0;
  let stopNotifications: (() => void) | null = null;
  let stopFeedback: (() => void) | null = null;
  let feedback = '';
  let previousFeedback: CameraSessionState['feedback'] = null;
  const listeners = new Set<(state: LiveCameraState) => void>();
  const requests = new Set<Promise<unknown>>();
  const trackedRpc = { callTool: (name: string, args: Record<string, unknown>) => {
    const request = ports.rpc.callTool(name, args);
    requests.add(request);
    void request.then(() => { requests.delete(request); }, () => { requests.delete(request); });
    return request;
  } };
  const messages = { 'snapshot-refreshed': 'Snapshot refreshed', 'snapshot-unavailable': 'Snapshot unavailable', 'live-unavailable': 'Live unavailable' };
  const emit = () => { if (!disposed) { const state = { camera: session.state(), feedback }; listeners.forEach((listener) => listener(state)); } };
  const notify = (message: string) => {
    if (disposed) return;
    stopFeedback?.(); stopFeedback = null;
    feedback = message; emit();
    if (message) stopFeedback = ports.scheduler.after(1800, () => { stopFeedback = null; feedback = ''; emit(); });
  };
  const session = createCameraSession({ ...ports, transport: cameraTransport(trackedRpc), changed: (state) => {
    if (state.feedback !== previousFeedback) {
      previousFeedback = state.feedback;
      if (state.feedback && feedbackOwner === generation) {
        const message = state.feedback === 'snapshot-unavailable' && !state.snapshot ? 'Camera unavailable' : messages[state.feedback];
        notify(message);
      }
    }
    emit();
  } });
  const beginAction = () => { feedbackOwner = ++generation; notify(''); };
  const start = () => {
    if (disposed || started) return;
    started = true;
    let bootstrap = Promise.resolve(false);
    stopNotifications = ports.rpc.subscribe((event) => {
      if (event.kind !== 'result' || disposed || hidden) return;
      try {
        const result = parseCameraFrame(event.value);
        if (!result.snapshot) return;
        notificationVersion++;
        bootstrap = session.acceptHostFrame(result);
      } catch { /* Other tools and invalid private envelopes are not camera data. */ }
    });
    const current = generation;
    void (async () => {
      const initialVersion = notificationVersion;
      const accepted = await bootstrap;
      if (disposed || hidden || generation !== current) return;
      if (!accepted && initialVersion === notificationVersion) await session.refreshSnapshot();
      else if (!accepted) await bootstrap;
      if (disposed || hidden || generation !== current) return;
      await session.restoreSavedIntent(ports.savedLiveIntent());
    })();
    // Snapshot/activation calls share this same initialization promise.
    void ports.rpc.start().catch(() => {});
  };
  return {
    state: (): LiveCameraState => ({ camera: session.state(), feedback }),
    subscribe: (listener: (state: LiveCameraState) => void) => { listeners.add(listener); listener({ camera: session.state(), feedback }); return () => { listeners.delete(listener); }; },
    start,
    refresh: () => { if (session.state().phase === 'connecting') return Promise.resolve(); beginAction(); return session.refreshSnapshot(); },
    goLive: () => { if (session.state().refreshing || !session.state().snapshot) return Promise.resolve(); beginAction(); return session.goLive(); },
    selectMode: (mode: Parameters<typeof session.selectMode>[0]) => { beginAction(); return session.selectMode(mode); },
    close: () => { beginAction(); session.close(); if (!session.state().snapshot) void session.refreshSnapshot(); },
    notify: (message: string) => { ++generation; notify(message); },
    pageHide: () => { if (disposed || hidden) return; hidden = true; beginAction(); session.pageHide(); },
    pageShow: () => { if (disposed || !hidden) return Promise.resolve(); hidden = false; return session.pageShow().then(() => { if (!session.state().snapshot && session.state().phase !== 'connecting') return session.refreshSnapshot(); }); },
    dispose: () => {
      if (disposed) return;
      ++generation; stopNotifications?.(); stopFeedback?.();
      session.dispose();
      // Drain late allocations and their best-effort close before removing the
      // host request map. Both downstream RPC rounds stay finitely bounded.
      const deadline = ports.scheduler.after(30000, ports.rpc.dispose);
      void (async () => {
        await Promise.resolve(); await Promise.resolve();
        while (requests.size) { await Promise.allSettled([...requests]); await Promise.resolve(); await Promise.resolve(); }
        deadline(); ports.rpc.dispose();
      })();
      disposed = true; listeners.clear();
    },
  };
};
