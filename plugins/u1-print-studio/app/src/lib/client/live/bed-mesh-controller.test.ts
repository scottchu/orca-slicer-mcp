import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBedMeshController } from './bed-mesh-controller';
import LiveBedMeshRoot from '../../../components/live/LiveBedMeshRoot.svelte';
import { liveBedMeshResult } from '../../../../tests/browser/fixtures/live-bed-mesh';
import { unavailableBedMesh } from '../../server/application/bed-mesh-observation';
const renderer = vi.hoisted(() => vi.fn());
vi.mock('../../../components/bed-mesh/BedMesh3D.svelte', () => ({ default: () => { renderer(); return {}; } }));
const setup = () => {
  let notify = (_value: unknown) => {};
  const port = { start: vi.fn(async () => {}), refresh: vi.fn(async () => liveBedMeshResult()),
    subscribe: (listener: (value: unknown) => void) => { notify = listener; return () => {}; }, dispose: vi.fn() };
  const controller = createBedMeshController(port, 100);
  return { controller, port, notify: (value: unknown) => notify(value) };
};
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('live Bed Mesh shared controller and native presentation', () => {
  it.each(['no-active', 'unknown', 'unsupported', 'unavailable'] as const)('renders %s without invented probe surface or Lab attribution', async state => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      app.notify(liveBedMeshResult(12, undefined, state === 'no-active'
        ? { status: 'no_active_mesh', matrix: null, bounds: null, summary: null }
        : unavailableBedMesh(state === 'unknown' ? 'not_requested' : state === 'unsupported' ? 'not_reported' : 'timeout')));
      await tick();
      const visibleNotice = view.container.querySelector('[data-footer-status]');
      expect(visibleNotice).toBeVisible();
      expect(visibleNotice).toHaveTextContent(state === 'no-active' ? 'No active mesh' : state === 'unknown' ? 'Not observed' : state === 'unsupported' ? 'Object not reported' : 'Unavailable');
      expect(visibleNotice).not.toHaveTextContent('Could not load');
      expect(view.container.textContent).not.toContain('Lab fixture');
      expect(renderer).not.toHaveBeenCalled();
      expect(view.container.querySelector('canvas')).toBeNull();
      expect(view.getByRole('button', { name: 'Refresh Bed Mesh' })).toBeTruthy();
    } finally { app.controller.dispose(); }
  });
  it('distinguishes an unsupported endpoint from an unreported bed-mesh object', async () => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      app.notify(liveBedMeshResult(12, undefined, unavailableBedMesh('unsupported'))); await tick();
      expect(view.container.querySelector('[data-footer-status]')).toBeVisible();
      expect(view.container.querySelector('[data-footer-status]')).toHaveTextContent('Endpoint unsupported');
      expect(view.container.textContent).not.toContain('Bed mesh object not reported');
    } finally { app.controller.dispose(); }
  });
  it('retains mesh resources while updating the latest failure reason and masking the optional profile', async () => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      app.notify(liveBedMeshResult(12, undefined, { profile: 'Reported profile' })); await tick();
      const kicker = view.container.querySelector('.mesh-kicker');
      expect(kicker).toHaveTextContent('Reported profile');
      const retainedMesh = app.controller.getState().observation?.mesh;
      app.notify(liveBedMeshResult(13, '2026-09-01T12:00:20.000Z', unavailableBedMesh('unsupported'))); await tick();
      expect(app.controller.getState().observation?.mesh).toBe(retainedMesh);
      expect(view.container.querySelector('[data-footer-status]')).toHaveTextContent('Endpoint unsupported');
      expect(kicker).not.toHaveTextContent('Reported profile');
      app.notify(liveBedMeshResult(14, '2026-09-01T12:00:21.000Z', unavailableBedMesh('not_reported'))); await tick();
      expect(app.controller.getState().observation?.mesh).toBe(retainedMesh);
      expect(view.container.querySelector('[data-footer-status]')).toHaveTextContent('Object not reported');
      expect(kicker).not.toHaveTextContent('Reported profile');
      app.notify(liveBedMeshResult(15, '2026-09-01T12:00:22.000Z')); await tick();
      expect(kicker).not.toHaveTextContent('Reported profile');
      expect(app.controller.getState().failureReason).toBeNull();
    } finally { app.controller.dispose(); }
  });
  it('keeps an independently fresh mesh visible while main status is offline, but masks a failed mesh read', async () => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      const fresh = liveBedMeshResult(); fresh.structuredContent.freshness = 'offline'; fresh.structuredContent.reachable = false;
      app.notify(fresh); await tick();
      expect(app.controller.getState().failure).toBeNull();
      expect(view.container.querySelector('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'false');
      expect(view.container.textContent).toContain('-0.200');
      const failed = liveBedMeshResult(13, '2026-09-01T12:00:20.000Z', { state: 'stale', freshness: 'stale', reason: 'timeout', checkedAt: '2026-09-01T12:00:20.000Z' });
      failed.structuredContent.freshness = 'offline'; failed.structuredContent.reachable = false;
      app.notify(failed); await tick();
      expect(app.controller.getState().failure).toBe('error');
      expect(view.container.querySelector('[data-retained-layer]')).toHaveProperty('inert', true);
      expect(view.container.querySelector('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
      expect(view.container.querySelector('[data-observed-meta]')).not.toHaveTextContent('Observed');
    } finally { app.controller.dispose(); }
  });
  it('masks a retained stale mesh when the next acquisition no longer reports the object', async () => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      app.notify(liveBedMeshResult()); await tick();
      app.notify(liveBedMeshResult(13, '2026-09-01T12:00:20.000Z', { state: 'stale', freshness: 'stale', reason: 'not_reported', checkedAt: '2026-09-01T12:00:20.000Z' }));
      await tick();
      expect(app.controller.getState().failure).toBe('unsupported');
      expect(view.container.querySelector('[data-retained-layer]')).toHaveProperty('inert', true);
      expect(view.container.querySelector('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
      expect(view.container.querySelector('[data-observed-meta]')).not.toHaveTextContent('Observed');
      expect(view.container.querySelector('[data-footer-status]')).toBeVisible();
      expect(view.container.querySelector('[data-footer-status]')).toHaveTextContent('Object not reported');
      expect(view.container.textContent).not.toContain('endpoint unsupported');
    } finally { app.controller.dispose(); }
  });
  it('labels an age-stale no-active observation with its visible stale receipt', async () => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      app.notify(liveBedMeshResult(12, undefined, { status: 'no_active_mesh', matrix: null, bounds: null, summary: null, state: 'stale', freshness: 'stale' }));
      await tick();
      expect(app.controller.getState().failure).toBeNull();
      expect(view.container.querySelector('[data-footer-status]')).toBeVisible();
      expect(view.container.querySelector('[data-footer-status]')).toHaveTextContent('No active mesh');
      expect(view.container.querySelector('[data-observed-meta]')).toHaveTextContent('Stale');
      expect(renderer).not.toHaveBeenCalled();
    } finally { app.controller.dispose(); }
  });
  it('uses the independent receipt, local mode/reset actions and a retained inert surface on failed Refresh', async () => {
    const app = setup();
    try {
      const view = render(LiveBedMeshRoot, { controller: app.controller });
      app.notify(liveBedMeshResult()); await tick();
      expect(view.container.textContent).not.toContain('Lab fixture');
      const received = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date('2026-09-01T11:59:58.000Z'));
      expect(view.container.querySelector('[data-observed-meta]')).toHaveTextContent(`Observed ${received}`);
      await fireEvent.click(view.getByRole('button', { name: 'Reset bed mesh view' }));
      expect(app.port.refresh).not.toHaveBeenCalled();
      await fireEvent.click(view.getByRole('radio', { name: '2D grid' }));
      expect(app.port.refresh).not.toHaveBeenCalled();
      expect(view.getByRole('button', { name: 'Reset bed mesh view' })).toBeDisabled();
      const canvas = view.container.querySelector('canvas');
      app.port.refresh.mockRejectedValueOnce(new Error('fixture timeout'));
      await fireEvent.click(view.getByRole('button', { name: 'Refresh Bed Mesh' }));
      await tick();
      expect(app.controller.getState().failure).toBe('error');
      expect(view.container.querySelector('[data-retained-layer]')).toHaveProperty('inert', true);
      expect(view.container.querySelector('[data-retained-layer]')).toHaveAttribute('aria-hidden', 'true');
      expect(view.container.querySelector('canvas')).toBe(canvas);
      expect(view.container.querySelector('[data-observed-meta]')).not.toHaveTextContent(`Observed ${received}`);
      const retry = view.getByRole('button', { name: 'Retry bed mesh' }); retry.focus();
      await fireEvent.click(retry); await tick(); await tick();
      expect(app.controller.getState().failure).toBeNull();
      expect(document.activeElement).toBe(view.getByRole('radio', { name: '2D grid' }));
      expect(app.port.refresh).toHaveBeenCalledTimes(2);
    } finally { app.controller.dispose(); }
  });
});
