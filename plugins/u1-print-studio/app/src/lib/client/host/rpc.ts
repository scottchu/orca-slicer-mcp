export type HostEvent = { kind: 'input' | 'result'; value: unknown };
export type HostDisplayMode = 'inline' | 'fullscreen' | 'pip';
export type HostContext = Readonly<Record<string, unknown>>;
export type HostRequestOptions = { timeoutMs?: number };
export type HostRpc = {
  start: () => Promise<void>;
  callTool: (name: string, args: Record<string, unknown>, options?: HostRequestOptions) => Promise<unknown>;
  requestDisplayMode: (mode: 'inline' | 'fullscreen') => Promise<HostDisplayMode>;
  subscribeContext: (listener: (context: HostContext, patch: HostContext) => void) => () => void;
  subscribe: (listener: (event: HostEvent) => void) => () => void;
  dispose: () => void;
};
type Compatibility = { toolInput?: unknown; toolOutput?: unknown; toolResponseMetadata?: unknown; safeArea?: unknown; displayMode?: unknown; availableDisplayModes?: unknown };
type HostWindow = Pick<Window, 'parent' | 'addEventListener' | 'removeEventListener'> & { openai?: Compatibility };
const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

/** One standard calling transport. Compatibility contributes data, never calls. */
export const createHostRpc = (host: HostWindow, options: {
  timeoutMs?: number;
  onHostContext?: (context: unknown) => void;
  onInitialized?: () => void;
} = {}): HostRpc => {
  const timeoutMs = options.timeoutMs ?? 15_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Invalid host deadline');
  const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  const listeners = new Set<(event: HostEvent) => void>();
  const contextListeners = new Set<(context: HostContext, patch: HostContext) => void>();
  let displayRevision = 0;
  let context: HostContext = {};
  const updateContext = (value: unknown) => {
    const patch = record(value);
    if (disposed || !patch) return;
    if (patch.displayMode === 'inline' || patch.displayMode === 'fullscreen' || patch.displayMode === 'pip') displayRevision++;
    context = { ...context, ...patch };
    options.onHostContext?.(context);
    for (const listener of contextListeners) listener(context, patch);
  };
  const latest = new Map<HostEvent['kind'], HostEvent>();
  const standard = new Set<HostEvent['kind']>();
  let sequence = 0, disposed = false;
  let initialized: Promise<void> | undefined;
  const emit = (event: HostEvent) => {
    if (disposed) return;
    latest.set(event.kind, event);
    for (const listener of listeners) listener(event);
  };
  const request = (method: string, params: unknown, requestTimeoutMs = timeoutMs): Promise<unknown> => {
    if (disposed) return Promise.reject(new Error('Host disposed'));
    if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) return Promise.reject(new Error('Invalid host deadline'));
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Host request timed out')); }, requestTimeoutMs);
      pending.set(id, { resolve, reject, timer });
      try { host.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*'); }
      catch { clearTimeout(timer); pending.delete(id); reject(new Error('Host unavailable')); }
    });
  };
  const receive = (event: MessageEvent) => {
    if (disposed || event.source !== host.parent) return;
    const message = record(event.data);
    if (!message || message.jsonrpc !== '2.0') return;
    if (typeof message.id === 'number') {
      const active = pending.get(message.id);
      if (!active || ('result' in message) === ('error' in message)) return;
      pending.delete(message.id); clearTimeout(active.timer);
      if ('error' in message) active.reject(new Error('Host request failed'));
      else active.resolve(message.result);
      return;
    }
    if (message.method === 'ui/notifications/tool-input') { standard.add('input'); emit({ kind: 'input', value: message.params }); }
    if (message.method === 'ui/notifications/tool-result') { standard.add('result'); emit({ kind: 'result', value: message.params }); }
    if (message.method === 'ui/notifications/host-context-changed') updateContext(message.params);
  };
  const globals = (value: Compatibility | undefined) => {
    if (!value) return;
    updateContext(value);
    if (!standard.has('input') && value.toolInput !== undefined) emit({ kind: 'input', value: value.toolInput });
    const metadata = record(value.toolResponseMetadata);
    const complete = metadata?.mcp_tool_result ?? metadata?.call_tool_result;
    if (!standard.has('result')) {
      if (complete !== undefined) emit({ kind: 'result', value: complete });
      else if (value.toolOutput !== undefined) emit({ kind: 'result', value: { structuredContent: value.toolOutput, _meta: metadata } });
    }
  };
  const compatibility = (event: Event) => globals(record((event as CustomEvent).detail)?.globals as Compatibility | undefined);
  host.addEventListener('message', receive as EventListener);
  host.addEventListener('openai:set_globals', compatibility);
  globals(host.openai);
  const start = (): Promise<void> => {
    if (disposed) return Promise.reject(new Error('Host disposed'));
    if (!initialized) initialized = request('ui/initialize', {
      appInfo: { name: 'u1-observation', version: '0.4.14' }, appCapabilities: {}, protocolVersion: '2026-01-26'
    }).then((value) => {
      if (disposed || !record(value)) throw new Error('Invalid host initialization');
      updateContext(record(value)?.hostContext);
      host.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {} }, '*');
      options.onInitialized?.();
    }).catch((error) => { initialized = undefined; throw error; });
    return initialized;
  };
  return {
    start,
    callTool: async (name, args, requestOptions) => {
      await start();
      return request('tools/call', { name, arguments: args }, requestOptions?.timeoutMs);
    },
    requestDisplayMode: async (mode) => {
      await start();
      const revision = displayRevision;
      const value = record(await request('ui/request-display-mode', { mode }));
      const actual = value?.mode;
      if (actual !== 'inline' && actual !== 'fullscreen' && actual !== 'pip') {
        throw new Error('Invalid host display mode');
      }
      if (revision === displayRevision) updateContext({ displayMode: actual });
      return actual;
    },
    subscribeContext: (listener) => {
      if (disposed) return () => {};
      contextListeners.add(listener);
      listener(context, context);
      return () => { contextListeners.delete(listener); };
    },
    subscribe: (listener) => {
      if (disposed) return () => {};
      listeners.add(listener);
      // Input must precede replayed output even if the host sent output first.
      for (const kind of ['input', 'result'] as const) { const event = latest.get(kind); if (event) listener(event); }
      return () => { listeners.delete(listener); };
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      host.removeEventListener('message', receive as EventListener);
      host.removeEventListener('openai:set_globals', compatibility);
      for (const active of pending.values()) { clearTimeout(active.timer); active.reject(new Error('Host disposed')); }
      pending.clear(); latest.clear(); listeners.clear(); contextListeners.clear(); context = {};
    }
  };
};
