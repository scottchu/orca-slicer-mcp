import type { HostRpc } from '../host/rpc';
import type { ObservationView } from '../mcp/observation-host';
import { mountLegacyRenderer } from './observation-renderer.js';
import styles from '../../../components/legacy/observation.css?raw';

export const failedLegacyResult = (value: unknown, depth = 0): boolean => {
  if (depth > 3 || value === null || typeof value !== 'object' || Array.isArray(value))
    return false;
  const result = value as Record<string, unknown>;
  return (
    result.isError === true ||
    ['result', 'mcp_tool_result', 'call_tool_result'].some((key) =>
      failedLegacyResult(result[key], depth + 1),
    )
  );
};

/** Retained renderer, isolated styles, shared host transport, bounded loading. */
export const mountLegacyObservation = (
  target: HTMLElement,
  rpc: HostRpc,
  view: Exclude<ObservationView, 'heads'>,
) => {
  const root = target.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;
  const shell = document.createElement('main');
  shell.className = 'shell';
  const modules = document.createElement('div');
  modules.className = 'modules';
  shell.append(modules);
  root.append(style, shell);
  let disposed = false;
  const renderer = mountLegacyRenderer(modules, view, async () => {
    const result = await rpc.callTool('refresh_printer_observation', { view });
    if (failedLegacyResult(result)) throw new Error('Observation request failed');
    return result;
  });
  const deadline = setTimeout(() => {
    if (!disposed) renderer.fail();
  }, 15_000);
  const unsubscribe = rpc.subscribe((event) => {
    if (disposed || event.kind !== 'result') return;
    if (failedLegacyResult(event.value)) {
      clearTimeout(deadline);
      renderer.fail();
    } else if (renderer.accept(event.value)) clearTimeout(deadline);
  });
  void rpc.start().catch(() => {
    if (!disposed) {
      clearTimeout(deadline);
      renderer.fail();
    }
  });
  return () => {
    disposed = true;
    clearTimeout(deadline);
    unsubscribe();
    renderer.dispose();
    root.replaceChildren();
  };
};
