import { resolveObservationFixture, type ObservationByView, type ObservationLabView } from './observation-fixtures';
import { loadingRows, type LabSelection } from './controller';
import { headsLoadingShapes } from './heads-loading';
import type { MaterialLoadingShapes } from '../observation/heads-loading';

type PreviewProps<V extends ObservationLabView> =
  | { loading: true; observation?: never; refreshing?: never; rows?: number; materialShapes?: MaterialLoadingShapes }
  | { loading: false; observation: ObservationByView[V]; refreshing: boolean; rows?: never; materialShapes?: never };

// Public controls determine the neutral anatomy; never inspect an observation
// to derive placeholder text, rows, colors or hidden sizing content.
export const observationProps = <V extends ObservationLabView>(selection: LabSelection<V>): PreviewProps<V> =>
  ['loading', 'error', 'unavailable'].includes(selection.phase)
    ? { loading: true, rows: loadingRows(selection as LabSelection), materialShapes: headsLoadingShapes(selection as LabSelection) }
    : { loading: false, observation: resolveObservationFixture(selection), refreshing: selection.phase === 'refreshing' };
