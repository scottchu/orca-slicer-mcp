export type SurfacePhase = 'loading' | 'ready' | 'refreshing' | 'error' | 'unavailable';
export const staticStructure = (phase: SurfacePhase): boolean => {
  if (!['loading', 'ready', 'refreshing', 'error', 'unavailable'].includes(phase)) throw new Error('Invalid widget surface phase');
  return phase !== 'loading';
};
