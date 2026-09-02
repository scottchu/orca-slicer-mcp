import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CurrentJobPanel from './CurrentJobPanel.svelte';
import LiveCurrentJobRoot from '../live/LiveCurrentJobRoot.svelte';
import { createCurrentJobController } from '../live/current-job-controller';
import { adaptCurrentJob } from '../live/current-job-adapter';
import { currentJobField, liveCurrentJobResult } from '../../../tests/fixtures/live-current-job';

afterEach(cleanup);
describe('Current Job compositional presentation', () => {
  it.each([
    ['printing', 'Current job'], ['paused', 'Paused job'], ['standby', 'Loaded file'],
    ['complete', 'Last reported job'], ['error', 'Last reported job'],
    ['cancelled', 'Last reported job'], ['unknown', 'Reported file']
  ] as const)('renders reported %s with contextual identity %s independently of storage and bytes', (state, fileLabel) => {
    const result = liveCurrentJobResult(); result.structuredContent.module.printState.value = state;
    result.structuredContent.module.storageActive.value = false;
    const job = adaptCurrentJob(result.structuredContent);
    const { container } = render(CurrentJobPanel, { job, phase: 'ready', evidence: job.state });
    expect(container).toHaveTextContent(state[0].toUpperCase() + state.slice(1));
    expect(container).toHaveTextContent('Inactive');
    expect(screen.getByText(fileLabel, { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '9007199254740991 bytes' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '0 seconds' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '12.5 seconds' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '0 mm' })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/%|Progress|Printing speed/);
  });
  it('does not infer a current job from a filename or active storage when state is unreported', () => {
    const result = liveCurrentJobResult();
    result.structuredContent.module.printState = currentJobField(false, null);
    result.structuredContent.module.storageActive.value = true;
    const job = adaptCurrentJob(result.structuredContent);
    render(CurrentJobPanel, { job, phase: 'ready' });
    expect(screen.getByText('Reported file', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('model.gcode', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Active', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText('Current job', { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText('Paused job', { exact: true })).not.toBeInTheDocument();
  });
  it('distinguishes reported no-file from missing filename and neutral unknown quantities', async () => {
    const result = liveCurrentJobResult(); result.structuredContent.module.filename = currentJobField<string>(true, null);
    const job = adaptCurrentJob(result.structuredContent);
    const { rerender } = render(CurrentJobPanel, { job, phase: 'ready' });
    expect(screen.getByText('No file reported')).toBeInTheDocument();
    result.structuredContent.module.filename = currentJobField<string>(false, null);
    result.structuredContent.module.storageActive = currentJobField<boolean>(false, null);
    result.structuredContent.module.filePositionBytes = currentJobField<number>(false, null);
    await rerender({ job: adaptCurrentJob(result.structuredContent), phase: 'ready' });
    expect(screen.queryByText('No file reported')).not.toBeInTheDocument();
    expect(screen.getAllByText('Unknown')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'bytes not reported' })).toHaveTextContent('—');
  });
  it('keeps loading inert with the same fact row structure and one status region', async () => {
    const { container, rerender } = render(CurrentJobPanel, { phase: 'loading' });
    expect(container.querySelectorAll('[data-reading-row]')).toHaveLength(6);
    expect(container.querySelector('[data-widget-shell]')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('button,input,a,[title], [aria-valuenow]')).toBeNull();
    expect(container).not.toHaveTextContent('model.gcode');
    expect(container.querySelectorAll('[data-text-skeleton]')).toHaveLength(6);
    for (const shape of container.querySelectorAll('[data-text-skeleton]')) expect(shape).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('status')).toHaveLength(1);
    await rerender({ phase: 'ready', job: adaptCurrentJob(liveCurrentJobResult().structuredContent) });
    expect(container.querySelectorAll('[data-reading-row]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-widget-footer] button')).toHaveLength(1);
  });
  it('does not replace or remount retained rows during refresh or failure', async () => {
    const job = adaptCurrentJob(liveCurrentJobResult().structuredContent);
    const { container, rerender } = render(CurrentJobPanel, { phase: 'ready', job });
    const rows = [...container.querySelectorAll('[data-reading-row]')];
    const button = screen.getByRole('button', { name: 'Refresh Current Job' }); button.focus();
    await rerender({ phase: 'ready', job, refreshing: true });
    expect([...container.querySelectorAll('[data-reading-row]')]).toEqual(rows);
    expect(button).toHaveFocus();
    await rerender({ phase: 'ready', job, refreshing: false, feedback: 'Refresh failed · showing previous observation' });
    expect([...container.querySelectorAll('[data-reading-row]')]).toEqual(rows);
    expect(container.querySelectorAll('[data-widget-shell]')).toHaveLength(1);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(button).toHaveFocus();
  });
  it('mounts the shared controller once, renders immediate failure and retry, and disposes subscriptions', async () => {
    let notify: (result: unknown) => void = () => {};
    const unsubscribe = vi.fn();
    const port = { start: vi.fn(async () => {}), refresh: vi.fn(async () => liveCurrentJobResult()), subscribe: (listener: typeof notify) => { notify = listener; return unsubscribe; }, dispose: vi.fn() };
    const controller = createCurrentJobController(port);
    const { unmount } = render(LiveCurrentJobRoot, { controller });
    expect(port.start).toHaveBeenCalledOnce();
    notify({ isError: true });
    await fireEvent.click(await screen.findByRole('button', { name: 'Retry Current Job' }));
    expect(await screen.findByText('model.gcode')).toBeInTheDocument();
    expect(port.refresh).toHaveBeenCalledOnce();
    await unmount();
    expect(unsubscribe).toHaveBeenCalledOnce(); expect(port.dispose).toHaveBeenCalledOnce();
  });
});
