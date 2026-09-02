import type { LabView } from '../observation/types';
import type { LabSelection } from './controller';
import { previewBedMeshState, resolveBedMeshFixture } from './bed-mesh-fixture';
import {
  previewObservationState,
  resolveObservationFixture,
  type ObservationByView as NonBedObservationByView
} from './observation-fixtures';

export type ObservationByView = NonBedObservationByView & {
  bed_mesh: ReturnType<typeof resolveBedMeshFixture>;
};

export const resolveFixture = <V extends LabView>(selection: LabSelection<V>): ObservationByView[V] =>
  (selection.view === 'bed_mesh'
    ? resolveBedMeshFixture(selection as LabSelection<'bed_mesh'>)
    : resolveObservationFixture(selection as LabSelection<Exclude<LabView, 'bed_mesh'>>)) as ObservationByView[V];

export const previewState = <V extends LabView>(selection: LabSelection<V>) =>
  selection.view === 'bed_mesh'
    ? previewBedMeshState(selection as LabSelection<'bed_mesh'>)
    : previewObservationState(selection as LabSelection<Exclude<LabView, 'bed_mesh'>>);
