import { defaultSelection, type LabSelection } from './controller';

const fans = defaultSelection('fans');
const valid: LabSelection = fans;
// @ts-expect-error A Bed Mesh scenario cannot be assigned to Fans.
const wrongScenario: LabSelection = { ...fans, scenario: 'flat' };
// @ts-expect-error Fans accepts its own closed variable keys only.
const wrongKey: LabSelection = { ...fans, values: { ...fans.values, anything: 'anything' } };
// @ts-expect-error Even a recognized key rejects values outside its closed set.
const wrongValue: LabSelection = { ...fans, values: { ...fans.values, rpm: 'infinite' } };
// @ts-expect-error Observation controls cannot become a camera controller.
const cameraKind: LabSelection = { ...fans, kind: 'camera' };
// @ts-expect-error The camera scenario cannot cross into observation lifecycle.
const cameraScenario: LabSelection = { ...fans, scenario: 'live' };
const narrow = (selection: LabSelection): string => selection.view === 'fans' ? selection.values.rpm : selection.scenario;
void [valid, wrongScenario, wrongKey, wrongValue, cameraKind, cameraScenario, narrow];
