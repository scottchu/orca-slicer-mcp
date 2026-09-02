type FocusLease = { ownsFocus: () => boolean; release: () => void };
type RetryFocusState = { retrying: boolean; mode: '2d' | '3d'; ready: boolean };
type RetryFocusPorts = {
  captureFocus: () => FocusLease | undefined;
  canRecoverFocus: () => boolean;
  focusSelected: () => void;
  afterRender: () => Promise<void>;
};

// View focus policy only: no DOM selectors, acquisition or retry scheduling.
export const createRetryFocusRecovery = (ports: RetryFocusPorts) => {
  let previous: RetryFocusState | undefined;
  let lease: FocusLease | undefined;
  let generation = 0;
  const release = () => { lease?.release(); lease = undefined; };
  return {
    update: (state: RetryFocusState) => {
      const token = ++generation;
      if (state.retrying && !previous?.retrying) lease = ports.captureFocus();
      if (previous && previous.mode !== state.mode) release();
      const recover = previous?.retrying && !state.retrying && state.ready && state.mode === '2d' && lease?.ownsFocus();
      previous = state;
      if (!state.retrying) release();
      // Capture ownership before native disabled blurs the initiating button.
      if (recover) void ports.afterRender().then(() => {
        if (token === generation && ports.canRecoverFocus()) ports.focusSelected();
      });
    },
    dispose: () => { generation += 1; release(); }
  };
};
