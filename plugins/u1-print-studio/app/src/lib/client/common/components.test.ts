import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';
import DegreeValue from '../../../components/common/DegreeValue.svelte';
import Timestamp from '../../../components/common/Timestamp.svelte';
import Icon from '../../../components/common/Icon.svelte';
import { ThermometerSun } from 'lucide-svelte';
import Label from '../../../components/common/Label.svelte';
import BoxLabel from '../../../components/common/BoxLabel.svelte';
import CircleLabel from '../../../components/common/CircleLabel.svelte';
import Name from '../../../components/common/Name.svelte';
import Skeleton from '../../../components/common/Skeleton.svelte';
import { formatDegree, formatTimestamp } from './format';
import { validateWidgetState } from '../observation/state';
import { thermalsLabFixture } from '../fixtures/observations';
import { validateThermals } from '../observation/types';
import { inspectComponent, checkComponents, exactTags } from '../../../../scripts/component-contract';
import { resolve } from 'node:path';

afterEach(cleanup);
describe('closed leaf foundation', () => {
  test.each([[220, '220°', '220 degrees Celsius'], [0, '0°', '0 degrees Celsius'], [-12, '-12°', '-12 degrees Celsius'], [null, '—', 'Temperature unavailable']] as const)('degree %s has meaningful accessible units', (value, visible, accessible) => {
    render(DegreeValue, { value });
    expect(screen.getByRole('img', { name: accessible })).toHaveTextContent(visible);
  });
  test('degree precision and non-finite fallback do not invent a measurement', () => {
    expect(formatDegree(12.34, 1)).toEqual({ visible: '12.3°', accessible: '12.3 degrees Celsius' });
    expect(formatDegree(-0)).toEqual(formatDegree(0));
    expect(formatDegree(NaN)).toEqual(formatDegree(null));
    expect(formatDegree(Infinity)).toEqual(formatDegree(null));
  });
  test('timestamp preserves canonical source and viewer-local seconds', () => {
    const value = thermalsLabFixture.sourceObservedAt;
    const { container } = render(Timestamp, { value });
    expect(container.querySelector('time')).toHaveAttribute('datetime', value);
    expect(container.querySelector('time')).toHaveTextContent(formatTimestamp(value)!);
    for (const invalid of [null, 'today', '2026-02-30T00:00:00.000Z', '2026-01-01']) expect(formatTimestamp(invalid)).toBeNull();
    cleanup(); render(Timestamp, { value: null });
    expect(screen.getByText('Time unavailable')).toBeInTheDocument();
  });
  test('icons distinguish decorative and named semantics; bordered icon is not an action', () => {
    const { container } = render(Icon, { icon: ThermometerSun });
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    cleanup(); render(Icon, { icon: ThermometerSun, decorative: false, label: 'Temperature' });
    expect(screen.getByRole('img', { name: 'Temperature' })).toBeInTheDocument();
    cleanup(); render(Icon, { icon: ThermometerSun, variant: 'bordered' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  test('labels and names render text without HTML interpretation', () => {
    for (const create of [() => render(Label, { text: '<b>Tool 1</b>' }), () => render(BoxLabel, { text: '<b>Tool 1</b>' }), () => render(CircleLabel, { text: '<b>Tool 1</b>' }), () => render(Name, { text: '<b>Tool 1</b>' })]) {
      const { container } = create();
      expect(container.querySelector('b')).toBeNull();
      expect(container).toHaveTextContent('<b>Tool 1</b>'); cleanup();
    }
  });
  test('a loading name preserves name typography without carrying observed text', () => {
    const { container } = render(Name, { loading: true });
    expect(container.querySelector('.name [data-loading-value]')).not.toBeNull();
    expect(container.querySelector('[data-required-text]')).toBeNull();
    expect(container.textContent).not.toMatch(/Tool|Queue|Fixture/);
  });
  test('a loading numeric box label takes bounded character structure, not a reported index', () => {
    const { container } = render(BoxLabel, { loading: true, numeric: true, characters: 2 });
    expect(container.querySelector('[data-text-skeleton]')).toHaveTextContent('00');
    expect(container.querySelector('[data-text-skeleton]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.box-label')).toHaveAttribute('aria-hidden', 'true');
    cleanup(); expect(() => render(BoxLabel, { loading: true, characters: 0 })).toThrow('Invalid label structure');
  });
  test.each(['text', 'value', 'icon', 'action', 'caption'] as const)('skeleton %s is inert and aria hidden', (shape) => {
    const { container } = render(Skeleton, { shape });
    expect(container.querySelector('[data-skeleton]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('button,input,a,[tabindex]')).toBeNull();
    expect(container.textContent).toBe('');
  });
});

describe('closed component/state contracts', () => {
  test('approved composition passes while each styling escape fails its own rule', () => {
    const prefix = '<script>import X from "../../../components/common/Name.svelte";</script>';
    const allowed = ['../../../components/common/Name.svelte'];
    expect(inspectComponent(`${prefix}<X text="Tool 1" />`, true, allowed).violations).toEqual([]);
    for (const attribute of ['class="bad"', 'style="color:red"']) expect(inspectComponent(`${prefix}<X ${attribute} />`, true, allowed).violations).toContain('styling escape');
    expect(inspectComponent(`${prefix}<X {...{}} />`, true, allowed).violations).toContain('escape SpreadAttribute');
    expect(inspectComponent('<script>let { content } = $props();</script>{@render content()}', true).violations).toContain('escape RenderTag');
  });
  test('registered tree obeys migration frontier', () => expect(checkComponents(resolve(process.cwd(), 'src/components'))).toEqual([]));
  test('legacy debt rejects same-count and lower-count unsafe tag substitutions', () => {
    expect(exactTags(['iframe'], ['div'])).toBe(false);
    expect(exactTags(['form'], ['div'])).toBe(false);
    expect(exactTags(['script'], ['div'])).toBe(false);
    expect(exactTags([], ['div'])).toBe(false);
    expect(exactTags(['span', 'div'], ['div', 'span'])).toBe(true);
  });
  test.each([
    '<span>raw</span>', '{@html "unsafe"}', '<svelte:element this="span" />',
    '<svelte:window onresize={() => {}} />', '<svelte:head><title>wrong</title></svelte:head>',
    '<script>import X from "./X.svelte";</script><X class="bad" />',
    '<script>import X from "./X.svelte";</script><X style="color:red" />',
    '<script>import X from "./X.svelte";</script><X {...{}} />',
    '<script>import { Box } from "lucide-svelte";</script><Box />',
    '<script>fetch("/bad");</script>', '<script>new WebSocket("bad");</script>',
    '<script>window.openai.callTool("bad");</script>', '<style>p {color:red}</style>',
    '<script>import X from "../../../adapter/private";</script><X />',
    '<script>let { X } = $props();</script><X />', '<script>import("bad");</script>',
    '<script>globalThis["fetch"]("bad");</script>'
  ])('rejects deliberate composition escape %s', (source) => expect(inspectComponent(source, true).violations.length).toBeGreaterThan(0));
  test('state discriminants prohibit fake loading observations and raw failures', () => {
    for (const value of [null, [], {}, { kind: 'unknown' }, { kind: 'loading', observation: thermalsLabFixture }, { kind: 'error', message: 'private details' }, { kind: 'ready' }, { kind: 'ready', observation: thermalsLabFixture, refreshing: 'yes' }]) {
      expect(() => validateWidgetState(value, validateThermals)).toThrow();
    }
    expect(validateWidgetState({ kind: 'loading' }, validateThermals)).toEqual({ kind: 'loading' });
    expect(validateWidgetState({ kind: 'ready', observation: thermalsLabFixture }, validateThermals)).toEqual({ kind: 'ready', observation: thermalsLabFixture, refreshing: false });
  });
});
