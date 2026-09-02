import type { HeadId } from './heads-presentation';
type CopyState = { copying: HeadId | null; feedback: string };
/** Injected clipboard edge. A newer intent or observation retires old completions. */
export const createCopyAction = (write: (text: string) => Promise<void>) => {
  let state: CopyState = { copying: null, feedback: '' }, generation = 0, disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<(state: CopyState) => void>();
  const publish = (next: CopyState) => { if (!disposed) { state = next; listeners.forEach((listener) => listener(state)); } };
  const invalidate = () => { generation++; if (timer) clearTimeout(timer); publish({ copying: null, feedback: '' }); };
  return {
    getState: () => state,
    subscribe: (listener: (state: CopyState) => void) => { listeners.add(listener); listener(state); return () => { listeners.delete(listener); }; },
    invalidate,
    notify: (feedback: string) => { invalidate(); const current = generation; publish({ copying: null, feedback }); timer = setTimeout(() => { if (current === generation) publish({ copying: null, feedback: '' }); }, 1600); },
    copy: async (id: HeadId, color: string) => {
      if (disposed || state.copying === id) return;
      const current = ++generation;
      if (timer) clearTimeout(timer);
      publish({ copying: id, feedback: `Copying ${color}` });
      let feedback: string;
      try { await write(color); feedback = `${color} copied`; } catch { feedback = `${color} copy unavailable`; }
      if (disposed || current !== generation) return;
      publish({ copying: null, feedback });
      timer = setTimeout(() => { if (current === generation) publish({ copying: null, feedback: '' }); }, 1600);
    },
    dispose: () => { invalidate(); disposed = true; listeners.clear(); },
  };
};
