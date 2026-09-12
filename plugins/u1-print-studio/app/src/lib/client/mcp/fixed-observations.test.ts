import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { unavailableCurrentJob } from '../../server/application/current-job-observation';
import { unavailableJobHistory } from '../../server/application/job-history-observation';
import ObservationRoot from '../../../components/mcp/ObservationRoot.svelte';
import type { HostEvent, HostRpc } from '../host/rpc';
import { liveFansResult } from '../../../../tests/browser/fixtures/live-fans';
import { liveThermalsResult } from '../../../../tests/browser/fixtures/live-thermals';
import { liveQueueResult } from '../../../../tests/browser/fixtures/live-queue';
import { focusedResult } from '../../../../tests/browser/fixtures/live-focused';

afterEach(cleanup);
const cases = [
  { view: 'fans', title: 'Fans & Air', result: () => liveFansResult() },
  { view: 'thermals', title: 'Thermals', result: () => liveThermalsResult() },
  { view: 'queue', title: 'Print Queue', result: () => liveQueueResult() },
  { view: 'progress', title: 'Print Progress', result: () => focusedResult('progress') },
  { view: 'jobs', title: 'Current Job', result: () => focusedResult('jobs') },
  { view: 'job_history', title: 'Job History', result: () => focusedResult('job_history') },
  { view: 'overview', title: 'Overview', result: () => focusedResult('overview') },
] as const;

const setup = (replay: HostEvent[]) => {
  const listeners = new Set<(event: HostEvent) => void>();
  const latest = new Map(replay.map(event => [event.kind, event]));
  let disposed = false;
  const rpc: HostRpc = {
    start: vi.fn(async () => {}),
    callTool: vi.fn(async () => ({})),
    requestDisplayMode: vi.fn(async () => 'inline' as const),
    subscribeContext: vi.fn(() => () => {}),
    subscribe: listener => {
      if (disposed) return () => {};
      listeners.add(listener);
      for (const event of latest.values()) listener(event);
      return () => { listeners.delete(listener); };
    },
    dispose: vi.fn(() => { disposed = true; listeners.clear(); latest.clear(); }),
  };
  return {
    rpc,
    emit: (event: HostEvent) => {
      latest.set(event.kind, event);
      for (const listener of listeners) listener(event);
    },
    listenerCount: () => listeners.size,
  };
};

describe.each(cases)('fixed MCP $view', ({ view, title, result }) => {
  it.each(['input-first', 'result-first'])('reuses the opening result through the native renderer: %s', async order => {
    const input: HostEvent = { kind: 'input', value: { arguments: { view } } };
    const output: HostEvent = { kind: 'result', value: result() };
    const { rpc, listenerCount } = setup(order === 'input-first' ? [input, output] : [output, input]);
    const mounted = render(ObservationRoot, { rpc });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`${title} loaded`));
    expect(screen.getByRole('heading', { name: title })).toBeVisible();
    expect(mounted.container.querySelector('.instrument')).toBeNull();
    expect(mounted.container.querySelector('[data-widget-shell]')).not.toBeNull();
    expect(rpc.callTool).not.toHaveBeenCalled();
    mounted.unmount();
    expect(listenerCount()).toBe(0);
    expect(rpc.dispose).toHaveBeenCalled();
  });

  it('keeps the mounted shell through failed Refresh and recovery using the selected view', async () => {
    const { rpc } = setup([{ kind: 'result', value: result() }]);
    vi.mocked(rpc.callTool).mockResolvedValueOnce({ ...result(), isError: true }).mockResolvedValueOnce(result());
    const mounted = render(ObservationRoot, { rpc });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`${title} loaded`));
    const shell = mounted.container.querySelector('[data-widget-shell]');
    const refresh = screen.getByRole('button', { name: `Refresh ${title}` });
    await fireEvent.click(refresh);
    expect(rpc.callTool).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`Could not load ${title}`));
    expect(mounted.container.querySelector('[data-widget-shell]')).toBe(shell);
    expect(mounted.container.querySelector('[data-skeleton], [data-loading-value]')).not.toBeNull();
    await fireEvent.click(screen.getByRole('button', { name: new RegExp(`^(Refresh|Retry) ${title.replace('&', '\&')}$`) }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`${title} loaded`));
    expect(mounted.container.querySelector('[data-widget-shell]')).toBe(shell);
    expect(rpc.callTool).toHaveBeenNthCalledWith(1, 'refresh_printer_observation', { view });
    expect(rpc.callTool).toHaveBeenNthCalledWith(2, 'refresh_printer_observation', { view });
  });

  it('ignores wrong-view results and retires on contradictory input without later revival', async () => {
    const { rpc, emit } = setup([{ kind: 'input', value: { arguments: { view } } }]);
    render(ObservationRoot, { rpc });
    const wrong = result();
    wrong.structuredContent.view = 'heads';
    emit({ kind: 'result', value: wrong });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`Loading ${title}`));
    emit({ kind: 'result', value: result() });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(`${title} loaded`));
    emit({ kind: 'input', value: { arguments: { view: 'heads' } } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Could not load. Reopen this card to try again.'));
    emit({ kind: 'result', value: result() });
    expect(screen.queryByRole('heading', { name: title })).toBeNull();
    expect(rpc.callTool).not.toHaveBeenCalled();
  });
});

it.each(['jobs', 'job_history'] as const)('fixed MCP %s shows small reported filament usage without rounding it to zero', async view => {
  const result = focusedResult(view);
  if (result.structuredContent.module.kind === 'jobs') result.structuredContent.module.filamentUsedMillimeters.value = 25;
  else if (result.structuredContent.module.kind === 'job_history') result.structuredContent.module.items[0].filamentUsedMillimeters = 25;
  const { rpc } = setup([{ kind: 'result', value: result }]);
  const mounted = render(ObservationRoot, { rpc });
  await waitFor(() => expect(mounted.container).toHaveTextContent('25 mm'));
  expect(mounted.container).not.toHaveTextContent('0.0 m');
  expect(mounted.container).not.toHaveTextContent('Lab fixture');
});


it.each(['jobs', 'job_history'] as const)('fixed MCP %s visibly distinguishes endpoint support from a failed acquisition', async view => {
  const unsupported = focusedResult(view, view === 'jobs' ? { currentJob: unavailableCurrentJob('unsupported') } : { jobHistory: unavailableJobHistory('unsupported') });
  const { rpc } = setup([{ kind: 'result', value: unsupported }]);
  vi.mocked(rpc.callTool).mockResolvedValueOnce({ ...focusedResult(view), isError: true });
  const mounted = render(ObservationRoot, { rpc });
  const footer = () => mounted.container.querySelector('[data-footer-status]');
  await waitFor(() => expect(footer()).toHaveTextContent(/^Endpoint unsupported$/));
  expect(footer()).toBeVisible();
  await fireEvent.click(screen.getByRole('button', { name: /^Retry / }));
  await waitFor(() => expect(footer()).toHaveTextContent(/^Could not load$/));
  expect(footer()).toBeVisible();
});
