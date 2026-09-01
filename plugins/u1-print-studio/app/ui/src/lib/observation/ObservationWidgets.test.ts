import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';
import {
  currentJobLabFixture, fansLabFixture, headsLabFixture, jobHistoryLabFixture,
  overviewLabFixture, progressLabFixture, queueLabFixture, thermalsLabFixture
} from '../fixtures/observations';
import CurrentJobWidget from './CurrentJobWidget.svelte';
import FansWidget from './FansWidget.svelte';
import HeadsWidget from './HeadsWidget.svelte';
import JobHistoryWidget from './JobHistoryWidget.svelte';
import OverviewWidget from './OverviewWidget.svelte';
import ProgressWidget from './ProgressWidget.svelte';
import QueueWidget from './QueueWidget.svelte';
import ThermalsWidget from './ThermalsWidget.svelte';
import {
  validateCurrentJob, validateFans, validateHeads, validateJobHistory,
  validateOverview, validateProgress, validateQueue, validateThermals
} from './types';

afterEach(cleanup);

const cases = [
  [OverviewWidget, overviewLabFixture, 'Overview'],
  [ProgressWidget, progressLabFixture, 'Print Progress'],
  [ThermalsWidget, thermalsLabFixture, 'Thermals'],
  [HeadsWidget, headsLabFixture, 'Heads & Filaments'],
  [CurrentJobWidget, currentJobLabFixture, 'Current Job'],
  [JobHistoryWidget, jobHistoryLabFixture, 'Job History'],
  [QueueWidget, queueLabFixture, 'Print Queue'],
  [FansWidget, fansLabFixture, 'Fans & Air']
] as const;

describe('observation lab widgets', () => {
  test.each(cases)('%s uses one shared anatomy and overlay feedback', async (component, observation, title) => {
    const { container } = render(component as never, { observation } as never);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-widget-shell]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-widget-header]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-widget-body]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-widget-footer]')).toHaveLength(1);
    await fireEvent.click(screen.getByRole('button', { name: 'Refresh lab fixture' }));
    expect(screen.getByRole('status')).toHaveTextContent('Lab fixture refreshed');
  });

  test('keeps user-facing domain rules compact and canonical', () => {
    const headsResult = render(HeadsWidget, { observation: headsLabFixture });
    expect(headsResult.container).not.toHaveTextContent(/filament (?:reported )?present/i);
    expect(screen.getByLabelText('Tool 4')).toHaveTextContent('Empty');
    expect(screen.getByLabelText('Tool 4')).toHaveTextContent('N/A');
    cleanup();

    const fansResult = render(FansWidget, { observation: fansLabFixture });
    expect(fansResult.container).not.toHaveTextContent(/Commanded|Measured/i);
    expect(fansResult.container.querySelectorAll('[data-fan-fill]')).toHaveLength(7);
    expect(fansResult.container).toHaveTextContent('9,126 RPM');
    cleanup();

    render(QueueWidget, { observation: queueLabFixture });
    expect(screen.getByRole('heading', { name: 'Print Queue' })).toBeInTheDocument();
  });

  test('keeps current job and history independent', () => {
    const currentResult = render(CurrentJobWidget, { observation: currentJobLabFixture });
    expect(currentResult.container).toHaveTextContent('Current Job');
    expect(currentResult.container).not.toHaveTextContent('Job History');
    cleanup();
    const historyResult = render(JobHistoryWidget, { observation: jobHistoryLabFixture });
    expect(historyResult.container).toHaveTextContent('Job History');
    expect(historyResult.container).not.toHaveTextContent('Current Job');
  });
});

describe('observation bridge validators', () => {
  test('accepts every canonical synthetic fixture', () => {
    expect(validateOverview(overviewLabFixture)).toEqual(overviewLabFixture);
    expect(validateProgress(progressLabFixture)).toEqual(progressLabFixture);
    expect(validateThermals(thermalsLabFixture)).toEqual(thermalsLabFixture);
    expect(validateHeads(headsLabFixture)).toEqual(headsLabFixture);
    expect(validateCurrentJob(currentJobLabFixture)).toEqual(currentJobLabFixture);
    expect(validateJobHistory(jobHistoryLabFixture)).toEqual(jobHistoryLabFixture);
    expect(validateQueue(queueLabFixture)).toEqual(queueLabFixture);
    expect(validateFans(fansLabFixture)).toEqual(fansLabFixture);
  });

  test('rejects unknown identity fields, malformed envelopes, non-finite values and contradictory domain data', () => {
    for (const [validator, fixture] of [
      [validateOverview, overviewLabFixture], [validateProgress, progressLabFixture],
      [validateThermals, thermalsLabFixture], [validateHeads, headsLabFixture],
      [validateCurrentJob, currentJobLabFixture], [validateJobHistory, jobHistoryLabFixture],
      [validateQueue, queueLabFixture], [validateFans, fansLabFixture]
    ] as const) {
      const polluted = { ...structuredClone(fixture), filename: '../../private/model.gcode' };
      expect(() => validator(polluted as never)).toThrow();
      const stale = { ...structuredClone(fixture), sourceObservedAt: 'yesterday' };
      expect(() => validator(stale as never)).toThrow();
      const wrongSource = { ...structuredClone(fixture), fixture: false };
      expect(() => validator(wrongSource as never)).toThrow();
    }
    const progress = structuredClone(progressLabFixture); progress.percent = Number.NaN;
    expect(() => validateProgress(progress)).toThrow();
    const heads = structuredClone(headsLabFixture); heads.items[3].material = '<script>alert(1)</script>';
    expect(() => validateHeads(heads)).toThrow();
    for (const unsafe of ['../../private/path', 'https://example.invalid', 'safe\u202Egpj.exe', '.', '..', 'line\nnext']) {
      const unsafeHeads = structuredClone(headsLabFixture); unsafeHeads.items[0].material = unsafe;
      expect(() => validateHeads(unsafeHeads)).toThrow();
    }
    const empty = structuredClone(headsLabFixture); empty.items[3].presence = false; empty.items[3].color = '#FFFFFF';
    expect(() => validateHeads(empty)).toThrow();
    const queue = structuredClone(queueLabFixture); queue.items[0].position = 2;
    expect(() => validateQueue(queue)).toThrow();
    const fans = structuredClone(fansLabFixture); fans.items[0].percent = 101;
    expect(() => validateFans(fans)).toThrow();
  });
});
