import { CAMERA_SCENARIOS, CAMERA_CAPABILITIES, isCameraScenario, type CameraScenario, type CameraCapabilityPolicy } from './state';

export type CameraSelection = Readonly<{ kind: 'camera'; scenario: CameraScenario; capability: CameraCapabilityPolicy }>;
export const cameraFields = [
  { key: 'scenario', label: 'Camera state', options: CAMERA_SCENARIOS },
  { key: 'capability', label: 'Display capabilities', options: CAMERA_CAPABILITIES },
] as const;
export const defaultCameraSelection = (): CameraSelection => ({ kind: 'camera', scenario: 'snapshot', capability: 'native' });
export const setCameraSelection = (selection: CameraSelection, key: string, value: string): CameraSelection => {
  if (key === 'scenario' && isCameraScenario(value)) return { ...selection, scenario: value };
  if (key === 'capability' && CAMERA_CAPABILITIES.some((option) => option.value === value)) return { ...selection, capability: value as CameraCapabilityPolicy };
  return selection;
};
export const readCameraSelection = (search: string): CameraSelection => {
  const query = new URLSearchParams(search);
  let selection = defaultCameraSelection();
  for (const { key } of cameraFields) {
    const values = query.getAll(`lab_${key}`);
    if (values.length === 1) selection = setCameraSelection(selection, key, values[0]);
  }
  return selection;
};
export const cameraSelectionSearch = (selection: CameraSelection): string => `?${new URLSearchParams({ lab_scenario: selection.scenario, lab_capability: selection.capability })}`;
