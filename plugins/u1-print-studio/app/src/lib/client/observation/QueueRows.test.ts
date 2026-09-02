import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import QueueRows from '../../../components/observation/QueueRows.svelte';
import QueueSkeleton from '../../../components/observation/QueueSkeleton.svelte';
import QueueSummary from '../../../components/observation/QueueSummary.svelte';
import { liveQueueResult } from '../../../../tests/browser/fixtures/live-queue';
import { adaptQueue } from '../live/queue-adapter';
afterEach(cleanup);

describe('composable ordered Queue records', () => {
  it('renders semantic order without using repeated filenames as identity', async () => {
    const items = adaptQueue(liveQueueResult().structuredContent).items;
    const view = render(QueueRows, { items });
    expect(view.getByRole('list')).toHaveAccessibleName('Reported print queue order');
    expect(view.getAllByRole('listitem')).toHaveLength(3);
    expect(view.getAllByText('Repeated fixture.gcode')).toHaveLength(2);
    expect(view.getByRole('img', { name: '0 seconds' })).toBeInTheDocument();
    expect(view.getByRole('img', { name: 'Duration not reported' })).toBeInTheDocument();
    const reversed = [...items].reverse().map((item, index) => ({ ...item, position: index + 1 }));
    await view.rerender({ items: reversed });
    expect(view.getAllByRole('listitem')[0]).toHaveTextContent('Fixture 3.gcode');
    expect(view.getAllByText('Repeated fixture.gcode')).toHaveLength(2);
  });
  it('renders all 100 retained records and their complete sanitized long names', () => {
    const items = adaptQueue(liveQueueResult(1000).structuredContent).items;
    items[0].filename = 'M'.repeat(154) + '.gcode'; items[1].filename = '模型'.repeat(77) + '.gcode';
    const view = render(QueueRows, { items });
    expect(view.getAllByRole('listitem')).toHaveLength(100);
    expect(view.getByText(items[0].filename)).toBeInTheDocument();
    expect(view.getByText(items[1].filename)).toBeInTheDocument();
  });
  it.each([0, 1, 3, 100])('loading structure %s contains no synthetic observed filename, timestamp, count or duration', (rows) => {
    const view = render(QueueSkeleton, { rows });
    expect(view.queryAllByRole('listitem')).toHaveLength(rows);
    expect(view.container.querySelectorAll('[data-loading-value]').length).toBeGreaterThan(0);
    expect(view.container.querySelector('time')).toBeNull();
    expect(view.queryByRole('img')).not.toBeInTheDocument();
    expect(view.container.textContent).not.toMatch(/Queue empty|0 jobs|0s|Fixture|2026/);
  });
  it('reported machine loading remains real data and never activates a skeleton', () => {
    const view = render(QueueSummary, { state: 'loading', count: 0 });
    expect(view.getByText('Loading')).toBeInTheDocument(); expect(view.getByText('0 jobs')).toBeInTheDocument();
    expect(view.container.querySelector('[data-loading-value]')).toBeNull();
  });
  it('unknown summary count and state remain different from zero', () => {
    const view = render(QueueSummary, { state: null, count: null });
    expect(view.getByText('State unknown')).toBeInTheDocument(); expect(view.getByText('Count unknown')).toBeInTheDocument();
    expect(view.container.textContent).not.toContain('0 jobs');
  });
});
