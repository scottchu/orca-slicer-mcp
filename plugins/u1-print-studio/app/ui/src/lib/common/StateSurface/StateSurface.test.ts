import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StateSurface from './StateSurface.svelte';
import { staticStructure, type SurfacePhase } from './types';
afterEach(cleanup);

describe('controlled stable widget surface', () => {
  it('permits animation only while initially loading and rejects invented states', () => {
    expect(staticStructure('loading')).toBe(false);
    for (const phase of ['ready', 'refreshing', 'error', 'unavailable'] as const) expect(staticStructure(phase)).toBe(true);
    expect(() => staticStructure('unsupported' as SurfacePhase)).toThrow('Invalid widget surface phase');
  });
  it('never remounts retained child DOM or injects lifecycle/actions/announcements', async () => {
    const mounted = vi.fn(), disposed = vi.fn();
    const children = createRawSnippet(() => ({ render: () => '<div><video></video><canvas></canvas><button>Local action</button></div>', setup: () => { mounted(); return disposed; } }));
    const view = render(StateSurface, { phase: 'ready', children });
    const video = view.container.querySelector('video'), canvas = view.container.querySelector('canvas'), button = view.getByRole('button');
    const stream = {} as MediaStream; video!.srcObject = stream; button.focus();
    for (const phase of ['refreshing', 'error', 'unavailable', 'ready', 'loading'] as const) {
      await view.rerender({ phase, children });
      expect(view.container.querySelector('video')).toBe(video);
      expect(view.container.querySelector('canvas')).toBe(canvas);
      expect(video!.srcObject).toBe(stream);
      expect(document.activeElement).toBe(button);
      expect(view.container.querySelectorAll('[role="status"],[aria-live],[aria-busy]')).toHaveLength(0);
    }
    expect(mounted).toHaveBeenCalledOnce(); expect(disposed).not.toHaveBeenCalled();
    view.unmount(); expect(disposed).toHaveBeenCalledOnce();
  });
});
