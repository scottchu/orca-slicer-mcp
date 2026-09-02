import { bedMeshSelectionSearch, readBedMeshSelection, type BedMeshLabSelection } from './lab-controller';

export const currentBedMeshSelection = (): BedMeshLabSelection => readBedMeshSelection(window.location.search);
export const writeBedMeshSelection = (selection: BedMeshLabSelection): void => { window.history.pushState(null, '', bedMeshSelectionSearch(selection)); };
export const resetBedMeshLocation = (): void => { window.history.pushState(null, '', window.location.pathname); };
export const watchBedMeshLocation = (changed: (selection: BedMeshLabSelection) => void): (() => void) => {
  const restore = (): void => changed(currentBedMeshSelection());
  window.addEventListener('popstate', restore);
  return () => window.removeEventListener('popstate', restore);
};
