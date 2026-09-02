import { expect, it } from 'vitest';
import { defaultSelection, setSelection } from './controller';
import { OBSERVATION_LAB_VIEWS } from './observation-fixtures';
import { observationProps } from './observation-props';

it.each(OBSERVATION_LAB_VIEWS)('%s initial failures use only public neutral props and retained error also has no telemetry', (view) => {
  const ready = defaultSelection(view);
  const props = observationProps(ready);
  expect(props.loading).toBe(false);
  for (const phase of ['loading', 'error', 'unavailable']) {
    const placeholder = observationProps(setSelection(ready, 'phase', phase));
    expect(placeholder.loading).toBe(true);
    expect(placeholder).not.toHaveProperty('observation');
  }
  const retained = observationProps(setSelection(ready, 'phase', 'retained-error'));
  expect(retained.loading).toBe(true);
  expect(retained).not.toHaveProperty('observation');
  expect(retained).not.toHaveProperty('refreshing');
});
