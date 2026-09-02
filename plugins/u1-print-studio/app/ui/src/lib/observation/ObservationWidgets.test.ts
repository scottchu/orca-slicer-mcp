import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
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
import { formatClock } from './format';

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
  test.each([false, null])('empty/unknown Heads action slots have no focusable Copy placeholder: %s', (presence) => {
    const observation = structuredClone(headsLabFixture);
    observation.items = observation.items.map((item) => ({ ...item, presence }));
    const { container } = render(HeadsWidget, { observation });
    expect(screen.queryByRole('button', { name: /^Copy T/ })).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-inset-card] .actions')).toHaveLength(4);
    expect(container.querySelectorAll('[data-inset-card] .actions :is(button,[role="button"],[tabindex])')).toHaveLength(0);
    expect(container.querySelectorAll('[data-inset-card] .neutral')).toHaveLength(0);
    expect(container.querySelectorAll('[data-inset-card].neutral')).toHaveLength(4);
    expect(screen.getByLabelText('Tool 1')).toHaveTextContent('Generic PLA');
  });
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
    expect(screen.getByLabelText('Tool 4')).not.toHaveTextContent('N/A');
    cleanup();

    const fansResult = render(FansWidget, { observation: fansLabFixture });
    expect(fansResult.container).not.toHaveTextContent(/Commanded|Measured/i);
    expect(fansResult.container.querySelectorAll('[data-percentage-background]')).toHaveLength(7);
    expect(fansResult.container).toHaveTextContent('9,126 RPM');
    cleanup();

    render(QueueWidget, { observation: queueLabFixture });
    expect(screen.getByRole('heading', { name: 'Print Queue' })).toBeInTheDocument();
    cleanup();

    render(ThermalsWidget, { observation: thermalsLabFixture });
    for (const label of ['Tool 1', 'Tool 2', 'Tool 3', 'Tool 4', 'Heater bed', 'Cavity']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText(/Extruder|Heater Bed/)).not.toBeInTheDocument();
  });

  test('uses viewer-local clocks consistently in history and queue rows', () => {
    const historyClock = formatClock(jobHistoryLabFixture.items[0].endedAt);
    const queueClock = new Date(queueLabFixture.items[0].addedAt).toLocaleString([], {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const expectedHistory = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    }).format(new Date(jobHistoryLabFixture.items[0].endedAt));
    expect(historyClock).toBe(expectedHistory);
    render(JobHistoryWidget, { observation: jobHistoryLabFixture });
    expect(screen.getByText(historyClock)).toBeInTheDocument();
    cleanup();
    const queue = render(QueueWidget, { observation: queueLabFixture });
    const added = queue.container.querySelector(`time[datetime="${queueLabFixture.items[0].addedAt}"]`);
    expect(added).toHaveTextContent(queueClock);
    expect(added).toHaveAttribute('title', queueLabFixture.items[0].addedAt);
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

  test('keeps active semantics independent and makes the latest Heads action authoritative', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const { container } = render(HeadsWidget, { observation: headsLabFixture });
    expect(screen.getByLabelText('Tool 3')).toHaveStyle('background-color: rgba(52, 135, 200, 0.030117647058823527)');
    expect(container.querySelectorAll('button[aria-label^="Copy T"]')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Copy T4 color/ })).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Copy T3 color #3487C880' }));
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('#3487C880');
    expect(screen.getByRole('status')).toHaveTextContent('#3487C880 copied');
    await fireEvent.click(screen.getByRole('button', { name: 'Refresh lab fixture' }));
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Lab fixture refreshed');
    await fireEvent.click(screen.getByRole('button', { name: 'Copy T3 color #3487C880' }));
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('#3487C880 copied');

    const changedColor = structuredClone(headsLabFixture);
    changedColor.items[0].color = '#7B4DFFFF';
    cleanup();
    const changed = render(HeadsWidget, { observation: changedColor });
    expect(screen.getByLabelText('Tool 1')).toHaveStyle('background-color: rgba(123, 77, 255, 0.06)');
    expect(changed.container.querySelector('[data-inset-card].active')).toHaveClass('active');
  });

  test('prevents stale clipboard completion from replacing a newer feedback action', async () => {
    type Deferred = { promise: Promise<void>; resolve: () => void; reject: () => void };
    const deferred = (): Deferred => {
      let resolve!: () => void;
      let reject!: () => void;
      const promise = new Promise<void>((ok, fail) => { resolve = ok; reject = () => fail(new Error('denied')); });
      return { promise, resolve, reject };
    };
    const pending: Deferred[] = [];
    const writeText = vi.fn().mockImplementation(() => {
      const next = deferred();
      pending.push(next);
      return next.promise;
    });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(HeadsWidget, { observation: headsLabFixture });
    const copy = screen.getByRole('button', { name: 'Copy T3 color #3487C880' });
    const refresh = screen.getByRole('button', { name: 'Refresh lab fixture' });

    await fireEvent.click(copy);
    expect(screen.getByRole('status')).toHaveTextContent('Copying #3487C880');
    await fireEvent.click(refresh);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Lab fixture refreshed');
    pending[0].resolve();
    await pending[0].promise;
    await Promise.resolve();
    expect(screen.getByRole('status')).toHaveTextContent('Lab fixture refreshed');

    await fireEvent.click(copy);
    expect(screen.getByRole('status')).toHaveTextContent('Copying #3487C880');
    await fireEvent.click(refresh);
    pending[1].reject();
    await pending[1].promise.catch(() => undefined);
    await Promise.resolve();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Lab fixture refreshed');

    await fireEvent.click(refresh);
    await fireEvent.click(copy);
    expect(screen.getByRole('status')).toHaveTextContent('Copying #3487C880');
    pending[2].resolve();
    await pending[2].promise;
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('#3487C880 copied'));

    await fireEvent.click(refresh);
    await fireEvent.click(copy);
    pending[3].reject();
    await pending[3].promise.catch(() => undefined);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('#3487C880 copy unavailable'));
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
    expect(validateHeads(empty).items[3].color).toBe('#FFFFFF');
    const queue = structuredClone(queueLabFixture); queue.items[0].position = 2;
    expect(() => validateQueue(queue)).toThrow();
    const fans = structuredClone(fansLabFixture); fans.items[0].percent = 101;
    expect(() => validateFans(fans)).toThrow();
  });

  test('accepts canonical RGB/RGBA colors and preserves normalized alpha semantics', () => {
    const heads = structuredClone(headsLabFixture);
    heads.items[0].color = '#abcdef80';
    heads.items[1].color = '#102030ff';
    const normalized = validateHeads(heads);
    expect(normalized.items[0].color).toBe('#ABCDEF80');
    expect(normalized.items[1].color).toBe('#102030FF');
    expect(normalized.items[2].color).toBe('#3487C880');
  });

  test('rejects per-view enum, number, time, shape, order and color boundary failures', () => {
    const changed = <T>(fixture: T, mutate: (draft: Record<string, unknown>) => void): unknown => {
      const draft = structuredClone(fixture) as Record<string, unknown>;
      mutate(draft);
      return draft;
    };
    const rejects = (validator: (value: unknown) => unknown, fixture: unknown, mutations: Array<(draft: Record<string, unknown>) => void>) => {
      for (const mutate of mutations) expect(() => validator(changed(fixture, mutate))).toThrow();
    };

    rejects(validateProgress, progressLabFixture, [
      (d) => { d.state = 'moving'; }, (d) => { d.percent = 101; },
      (d) => { d.currentLayer = 651; }, (d) => { d.elapsedSeconds = -1; },
      (d) => { d.totalLayers = 1.5; }, (d) => { d.extra = true; }
    ]);
    rejects(validateThermals, thermalsLabFixture, [
      (d) => { (d.readings as Record<string, unknown>[])[0].id = 'tool-2'; },
      (d) => { (d.readings as unknown[]).pop(); },
      (d) => { (d.readings as Record<string, unknown>[])[0].active = 'yes'; },
      (d) => { (d.readings as Record<string, unknown>[])[0].actualC = 401; },
      (d) => { (d.readings as Record<string, unknown>[])[0].targetC = -1; },
      (d) => { (d.readings as Record<string, unknown>[])[0].extra = true; }
    ]);
    rejects(validateHeads, headsLabFixture, [
      (d) => { (d.items as Record<string, unknown>[])[0].physicalTool = 2; },
      (d) => { (d.items as Record<string, unknown>[])[1].active = true; },
      (d) => { (d.items as Record<string, unknown>[])[0].presence = 'yes'; },
      (d) => { (d.items as Record<string, unknown>[])[0].color = '#12345'; },
      (d) => { (d.items as Record<string, unknown>[])[0].color = '#123456789'; },
      (d) => { (d.items as Record<string, unknown>[])[0].actualC = Infinity; },
      (d) => { (d.items as Record<string, unknown>[])[0].extra = true; }
    ]);
    rejects(validateCurrentJob, currentJobLabFixture, [
      (d) => { d.state = 'queued'; }, (d) => { d.storageActive = 'yes'; },
      (d) => { d.progressPercent = -1; }, (d) => { d.elapsedSeconds = 1.5; },
      (d) => { d.filamentUsedMm = 100_000_001; }, (d) => { d.extra = true; }
    ]);
    rejects(validateJobHistory, jobHistoryLabFixture, [
      (d) => { (d.items as Record<string, unknown>[])[0].status = 'printing'; },
      (d) => { (d.items as Record<string, unknown>[])[0].position = 2; },
      (d) => { (d.items as Record<string, unknown>[])[0].endedAt = '2026-09-01'; },
      (d) => { (d.items as Record<string, unknown>[])[0].durationSeconds = -1; },
      (d) => { (d.items as Record<string, unknown>[])[0].extra = true; }
    ]);
    rejects(validateQueue, queueLabFixture, [
      (d) => { d.queueState = 'running'; },
      (d) => { (d.items as Record<string, unknown>[])[0].position = 3; },
      (d) => { (d.items as Record<string, unknown>[])[0].addedAt = 'not-a-time'; },
      (d) => { (d.items as Record<string, unknown>[])[0].waitingSeconds = -1; },
      (d) => { (d.items as Record<string, unknown>[])[0].extra = true; }
    ]);
    rejects(validateFans, fansLabFixture, [
      (d) => { d.purifierMode = 'turbo'; },
      (d) => { (d.items as Record<string, unknown>[])[0].id = 'cavity'; },
      (d) => { (d.items as Record<string, unknown>[])[0].percent = -1; },
      (d) => { (d.items as Record<string, unknown>[])[0].rpm = 100_001; },
      (d) => { (d.items as Record<string, unknown>[])[0].extra = true; }
    ]);
    rejects(validateOverview, overviewLabFixture, [
      (d) => { (d.progress as Record<string, unknown>).state = 'moving'; },
      (d) => { (d.progress as Record<string, unknown>).percent = 101; },
      (d) => { (d.thermals as Record<string, unknown>).nozzleC = NaN; },
      (d) => { (d.heads as Record<string, unknown>).loaded = 5; },
      (d) => { (d.heads as Record<string, unknown>).activeTool = 5; },
      (d) => { (d.jobs as Record<string, unknown>).state = 'queued'; },
      (d) => { (d.jobHistory as Record<string, unknown>).returned = 21; },
      (d) => { (d.queue as Record<string, unknown>).count = 101; },
      (d) => { (d.fans as Record<string, unknown>).active = 8; },
      (d) => { (d.bedMesh as Record<string, unknown>).rangeMm = -1; },
      (d) => { (d.progress as Record<string, unknown>).extra = true; }
    ]);
  });
});
