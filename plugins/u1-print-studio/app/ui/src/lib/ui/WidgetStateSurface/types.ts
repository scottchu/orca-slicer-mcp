export type WidgetSurfacePhase = 'loading' | 'ready' | 'refreshing' | 'error' | 'unavailable';
export const staticStructure = (phase: WidgetSurfacePhase): boolean => {
  if (!['loading', 'ready', 'refreshing', 'error', 'unavailable'].includes(phase)) throw new Error('Invalid widget surface phase');
  return phase !== 'loading';
};
