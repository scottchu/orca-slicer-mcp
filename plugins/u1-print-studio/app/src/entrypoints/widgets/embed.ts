import { mount, unmount } from 'svelte';
import BedMeshWidget from '../../components/bed-mesh/BedMeshWidget.svelte';
import type { BedMeshObservation } from '../../lib/client/bed-mesh/types';
import '../../components/common/tokens.css';

export type BedMeshWidgetHandle = { destroy(): Promise<void> };

export function mountBedMeshWidget(target: Element, observation: BedMeshObservation): BedMeshWidgetHandle {
  const component = mount(BedMeshWidget, { target, props: { observation } });
  return { destroy: () => unmount(component) };
}
