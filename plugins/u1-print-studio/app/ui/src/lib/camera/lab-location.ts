import { cameraSelectionSearch, readCameraSelection, type CameraSelection } from './controller';

// Browser location is a lab-only edge, never a source of arbitrary widget data.
export const currentCameraSelection = (): CameraSelection => readCameraSelection(window.location.search);
export const writeCameraSelection = (selection: CameraSelection): void => { window.history.pushState(null, '', cameraSelectionSearch(selection)); };
export const resetCameraLocation = (): void => { window.history.pushState(null, '', window.location.pathname); };
export const watchCameraLocation = (changed: (selection: CameraSelection) => void): (() => void) => {
  const restore = (): void => changed(currentCameraSelection());
  window.addEventListener('popstate', restore);
  return () => window.removeEventListener('popstate', restore);
};
