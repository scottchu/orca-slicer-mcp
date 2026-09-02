import { mount, unmount } from 'svelte';
import BedMeshWidget from './bed-mesh/BedMeshWidget.svelte';
import type { BedMeshObservation } from './bed-mesh/types';
import './common/tokens.css';

export type BedMeshWidgetHandle = { destroy(): Promise<void> };

export function mountBedMeshWidget(target: Element, observation: BedMeshObservation): BedMeshWidgetHandle {
  const component = mount(BedMeshWidget, { target, props: { observation } });
  return { destroy: () => unmount(component) };
}
