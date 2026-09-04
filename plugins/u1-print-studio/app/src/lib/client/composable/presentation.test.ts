import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';
import PresentationRenderer from '../../../components/composable/PresentationRenderer.svelte';
import type { HostEvent, HostRpc } from '../host/rpc';
import { t1BalancedCompositionSpec, t1CompactGridSpec, t1EntityCardSpec, t1LargerCompositionSpec } from '../../composable/specs';
import { composableViewModelSchema } from '../../composable/view-model';
import { composeEntityCard, type ComposableReaders } from '../../server/composable-presentation';
import { createComposableHost, eventComposableViewModel } from './host';
import { createPlaceholderPresentation } from './presentation';

afterEach(() => { cleanup(); vi.useRealTimers(); });

const hostFixture = (): { rpc: HostRpc; emit: (event: HostEvent) => void } => {
  const listeners = new Set<(event: HostEvent) => void>();
  return {
    rpc: {
      start: vi.fn(async () => {}), callTool: vi.fn(async () => ({})), requestDisplayMode: vi.fn(async () => 'inline' as const),
      subscribeContext: vi.fn(() => vi.fn()), subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); }, dispose: vi.fn(),
    },
    emit: (event) => listeners.forEach((listener) => listener(event)),
  };
};

const readers: ComposableReaders = {
  status: async () => ({ observedAt: '2026-09-03T16:20:00.000Z', receivedAt: '2026-09-03T16:20:00.100Z', heads: [{ id: 'T1', status: 'active', actualC: 214.6, targetC: 220 }] }),
  materials: async () => ({ observedAt: '2026-09-03T16:19:45.000Z', receivedAt: '2026-09-03T16:19:45.250Z', heads: [{ id: 'T1', color: '#E89B3C' }] }),
  environment: async () => ({ observedAt: '2026-09-03T16:19:30.000Z', receivedAt: '2026-09-03T16:19:30.500Z', relations: [{ headId: 'T1', fanId: 'part', label: 'Reported part fan', role: 'partCooling' }] }),
};
const topology = (node: { type: string; children?: Array<any>; child?: any }): string[] => [node.type, ...(node.children?.flatMap(topology) ?? []), ...(node.child ? topology(node.child) : [])];

describe('composable renderer and host lifecycle', () => {
  test('loading and error preserve node topology while error skeletons are neutral and inert', () => {
    const loadingPresentation = createPlaceholderPresentation(t1EntityCardSpec, 'loading');
    const errorPresentation = createPlaceholderPresentation(t1EntityCardSpec, 'error');
    expect(composableViewModelSchema.parse(loadingPresentation)).toEqual(loadingPresentation);
    expect(composableViewModelSchema.parse(errorPresentation)).toEqual(errorPresentation);
    const loading = render(PresentationRenderer, { presentation: loadingPresentation });
    const topology = [...loading.container.querySelectorAll('[data-node-kind]')].map((node) => node.getAttribute('data-node-kind'));
    expect(loading.container.querySelector('article')).toHaveAttribute('aria-busy', 'true');
    expect(loading.container.querySelectorAll('[data-skeleton]')).toHaveLength(4);
    expect(loading.container.querySelectorAll('[data-skeleton]:not([data-skeleton-static])')).toHaveLength(4);
    cleanup();
    const failed = render(PresentationRenderer, { presentation: errorPresentation });
    expect([...failed.container.querySelectorAll('[data-node-kind]')].map((node) => node.getAttribute('data-node-kind'))).toEqual(topology);
    expect(failed.container.querySelector('article')).toHaveAttribute('aria-busy', 'false');
    expect(failed.container.querySelectorAll('[data-skeleton]')).toHaveLength(4);
    expect(failed.container.querySelector('button,a,input,[tabindex]')).toBeNull();
    expect(screen.getByText('Some sources are unavailable. Recovery controls are outside this prototype.')).toBeInTheDocument();
    expect(failed.container.querySelectorAll('[data-skeleton-static]')).toHaveLength(4);
    expect(failed.container.querySelector('[role="cell"]')).toBeNull();
  });

  test('partial error keeps healthy values visible and every unavailable skeleton static', async () => {
    const result = await composeEntityCard(t1EntityCardSpec, {
      ...readers,
      environment: async () => { throw new Error('offline'); },
    });
    const rendered = render(PresentationRenderer, { presentation: result.viewModel });
    expect(result.viewModel.state).toBe('error');
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('#E89B3C')).toBeInTheDocument();
    expect(rendered.container.querySelectorAll('[data-skeleton-static]')).toHaveLength(1);
    expect(rendered.container.querySelectorAll('[data-skeleton]:not([data-skeleton-static])')).toHaveLength(0);
  });

  test('renders closed domain labels and role-derived fan primary text', async () => {
    const result = await composeEntityCard(t1EntityCardSpec, readers);
    const rendered = render(PresentationRenderer, { presentation: result.viewModel });
    expect(screen.getByText('Actual / target')).toBeInTheDocument();
    expect([...rendered.container.querySelectorAll('[data-node-kind="Metric"] .current')]
      .find((element) => element.textContent?.startsWith('214.6°'))?.textContent).toBe('214.6° / 220°\u00a0C');
    expect(screen.getByText('Configured filament color')).toBeInTheDocument();
    expect(screen.getByText('Part cooling')).toBeInTheDocument();
    expect(screen.queryByText('Reported part fan')).not.toBeInTheDocument();
    expect(rendered.container.querySelector('[role="cell"]')).toBeNull();
    expect(rendered.container.querySelector('[data-node-kind="Table"], [data-node-kind="Row"]')).toBeNull();
    expect(rendered.container.querySelector('[data-percentage-background]')).toBeNull();
  });

  test('uses validated input spec for exact loading, ready, and error topology', async () => {
    for (const spec of [t1EntityCardSpec, t1CompactGridSpec, t1LargerCompositionSpec, t1BalancedCompositionSpec]) {
      const fixture = hostFixture();
      const host = createComposableHost(fixture.rpc);
      fixture.emit({ kind: 'input', value: { arguments: { spec } } });
      expect(host.state().spec).toEqual(spec);
      expect(host.state().presentation?.state).toBe('loading');
      expect(topology(host.state().presentation!.root)).toEqual(topology(spec.root));
      const envelope = await composeEntityCard(spec, readers);
      expect(eventComposableViewModel({ kind: 'result', value: { structuredContent: envelope } })).toEqual(envelope.viewModel);
      expect(eventComposableViewModel({ kind: 'result', value: { structuredContent: { viewModel: envelope.viewModel } } })).toBeNull();
      fixture.emit({ kind: 'result', value: { structuredContent: envelope } });
      expect(host.state().failed).toBe(false);
      expect(topology(host.state().presentation!.root)).toEqual(topology(spec.root));
      host.dispose();

      const failedFixture = hostFixture();
      const failed = createComposableHost(failedFixture.rpc);
      failedFixture.emit({ kind: 'input', value: { arguments: { spec } } });
      failedFixture.emit({ kind: 'result', value: { structuredContent: { ...envelope, canonicalSpecSha256: 'f'.repeat(64) } } });
      expect(failed.state()).toMatchObject({ spec, failed: true, presentation: { state: 'error' } });
      expect(topology(failed.state().presentation!.root)).toEqual(topology(spec.root));
      failed.dispose();
    }
  });

  test('renders the balanced header without a printer icon or empty reading slot', async () => {
    const result = await composeEntityCard(t1BalancedCompositionSpec, readers);
    const rendered = render(PresentationRenderer, { presentation: result.viewModel });
    const inline = rendered.container.querySelector('[data-node-kind="Inline"]');
    expect(inline).not.toBeNull();
    expect(inline?.querySelector('[data-domain-reading]')).toBeNull();
    expect(inline?.querySelector('svg')).toBeNull();
    expect(inline).toHaveTextContent('Tool head T1');
    expect(inline).toHaveTextContent('Active');
    expect(result.viewModel.root.tint).toBeNull();
    expect(result.viewModel.root.transformEvidence).toBeNull();
    expect(rendered.container.querySelectorAll('[data-reading-appearance="hero"]')).toHaveLength(1);
    expect(rendered.container.querySelectorAll('[data-reading-appearance="quiet"]')).toHaveLength(2);
  });

  test('strict output validation rejects semantic state, provenance, and timestamp contradictions', () => {
    const baseline = createPlaceholderPresentation(t1EntityCardSpec, 'loading');
    const corruptProvenance = (model: typeof baseline) => {
      const root = model.root;
      if (root.type !== 'Card') throw new Error('Expected card fixture');
      const layout = root.children[1];
      const value = layout.children.find((node) => 'value' in node);
      if (!value || !('value' in value)) throw new Error('Expected value fixture');
      value.value.provenance.source = 'materials';
    };
    for (const mutate of [
      (model: typeof baseline) => { model.state = 'ready'; },
      (model: typeof baseline) => { model.sources[0].observedAt = '2026-09-03T00:00:00.000Z'; },
      corruptProvenance,
    ]) {
      const model = structuredClone(baseline);
      mutate(model);
      expect(composableViewModelSchema.safeParse(model).success).toBe(false);
    }
    const misleading = structuredClone(baseline) as any;
    const status = misleading.root.children[1].children.find((node: any) => node.type === 'HeadStatus');
    if (!status) throw new Error('Expected status fixture');
    status.type = 'FanRelation';
    expect(composableViewModelSchema.safeParse(misleading).success).toBe(false);
  });

  test('rejects malformed result envelopes, bounds absent delivery, and releases all owned lifecycle work', async () => {
    vi.useFakeTimers();
    const fixture = hostFixture();
    const host = createComposableHost(fixture.rpc, 50);
    fixture.emit({ kind: 'result', value: { structuredContent: { viewModel: { schemaVersion: 1, root: { type: 'Html' } } } } });
    expect(host.state()).toEqual({ spec: null, presentation: null, failed: true });
    host.dispose();
    expect(fixture.rpc.dispose).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);

    const absentFixture = hostFixture();
    const absent = createComposableHost(absentFixture.rpc, 50);
    await vi.advanceTimersByTimeAsync(50);
    expect(absent.state()).toEqual({ spec: null, presentation: null, failed: true });
    absent.dispose();
    expect(vi.getTimerCount()).toBe(0);
    expect(eventComposableViewModel({ kind: 'result', value: { isError: true } })).toBeNull();
  });
});
