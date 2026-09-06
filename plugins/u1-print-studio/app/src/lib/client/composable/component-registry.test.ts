import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { componentRegistry, componentRegistryContractChecks, resolveRegisteredNode } from '../../../components/composable/component-registry';
import { PRESENTATION_ELEMENT_TYPES } from '../../composable/element-registry';
import { t1BalancedCompositionSpec, t1EntityCardSpec, t1ExplicitGroupedSummarySpec, t1SmartGroupedSummarySpec } from '../../composable/specs';
import type { PresentationRenderContext } from './component-props';
import type { ResolvedNode } from '../../composable/view-model';
import { createPlaceholderPresentation } from './presentation';

describe('static composable component registry', () => {
  test('has exact parity with the pure element registry and no runtime loading path', () => {
    expect(Object.keys(componentRegistry)).toEqual(PRESENTATION_ELEMENT_TYPES);
    expect(Object.values(componentRegistryContractChecks).every(Boolean)).toBe(true);
    expect(Object.values(componentRegistry).every((entry) =>
      typeof entry.component === 'function' && typeof entry.getProps === 'function' && typeof entry.resolve === 'function')).toBe(true);
    const source = readFileSync(resolve(process.cwd(), 'src/components/composable/component-registry.ts'), 'utf8');
    expect(source).not.toMatch(/\bimport\s*\(|\brequire\s*\(|https?:|file:|modulePath|componentPath/iu);
    expect(source).not.toContain('Component<Record<string, any>>');
    expect(source).not.toContain('DynamicPresentationComponentProps');
    expect(source).toContain('PresentationComponentPropsByElement');
    for (const type of PRESENTATION_ELEMENT_TYPES) expect(source).toContain(type);
  });

  test('keeps concrete dispatch in typed entries and renders recursively by role only', () => {
    const root = createPlaceholderPresentation(t1EntityCardSpec, 'loading').root;
    const nodes: ResolvedNode[] = [];
    const visit = (node: ResolvedNode): void => {
      nodes.push(node);
      if ('children' in node) node.children.forEach(visit);
    };
    visit(root);
    for (const node of nodes) {
      const registered = resolveRegisteredNode(node, { subjectLabel: 'Tool head T1', busy: true });
      expect(registered.role).toBe(componentRegistry[node.type].role);
      expect(typeof registered.component).toBe('function');
      expect(Object.keys(registered.props).length).toBeGreaterThan(0);
      expect(registered.children === null).toBe(!['root', 'layout', 'semantic'].includes(registered.role));
      if (registered.role === 'domain') expect(registered.props).toHaveProperty('value');
    }

    const renderer = readFileSync(resolve(process.cwd(), 'src/components/composable/PresentationNode.svelte'), 'utf8');
    expect(renderer).not.toContain('node.type');
    for (const type of PRESENTATION_ELEMENT_TYPES) expect(renderer).not.toMatch(new RegExp(`\\b${type}\\b`, 'u'));
    expect(renderer).toContain("registered.role === 'root' || registered.role === 'layout' || registered.role === 'semantic'");
    expect(renderer).toContain('resolveRegisteredNode');
  });

  test('resolves the balanced tree while retaining exact twelve-entry registry parity', () => {
    const root = createPlaceholderPresentation(t1BalancedCompositionSpec, 'loading').root;
    const resolved: Array<{ type: string; role: string; props: Record<string, unknown> }> = [];
    const visit = (node: ResolvedNode, context: PresentationRenderContext = { subjectLabel: 'Tool head T1', busy: true }): void => {
      const entry = resolveRegisteredNode(node, context);
      resolved.push({ type: node.type, role: entry.role, props: entry.props });
      for (const child of entry.children ?? []) visit(child, entry.childContext);
    };
    visit(root);
    expect(Object.keys(componentRegistry)).toHaveLength(12);
    expect(resolved.map(({ type }) => type)).toEqual(['Card', 'Inline', 'Title', 'HeadStatus', 'Grid', 'HeadTemperature', 'FilamentColor', 'FanRelation']);
    expect(resolved.find(({ type }) => type === 'Inline')?.props).toMatchObject({ gap: 'regular', distribution: 'split', inset: true, composed: true });
    expect(resolved.find(({ type }) => type === 'Grid')?.props).toMatchObject({ arrangement: 'lead' });
    expect(resolved.find(({ type }) => type === 'HeadStatus')?.props).toMatchObject({ appearance: 'headerBadge' });
    expect(resolved.find(({ type }) => type === 'HeadTemperature')?.props).toMatchObject({ appearance: 'hero', density: 'compact' });
    expect(resolved.filter(({ type }) => type === 'FilamentColor' || type === 'FanRelation').every(({ props }) => props.appearance === 'quiet')).toBe(true);
  });

  test('renders smart and explicit groups through the same typed structural entries', () => {
    for (const [spec, source] of [[t1SmartGroupedSummarySpec, 'smart'], [t1ExplicitGroupedSummarySpec, 'explicit']] as const) {
      const root = createPlaceholderPresentation(spec, 'loading').root;
      const resolved: Array<{ type: string; props: Record<string, unknown> }> = [];
      const visit = (node: ResolvedNode, context: PresentationRenderContext = { subjectLabel: 'Tool head T1', busy: true }): void => {
        const entry = resolveRegisteredNode(node, context);
        resolved.push({ type: node.type, props: entry.props });
        for (const child of entry.children ?? []) visit(child, entry.childContext);
      };
      visit(root);
      expect(resolved.map(({ type }) => type)).toEqual(['Card', 'Group', 'Title', 'HeadStatus', 'Group', 'Row', 'Column', 'HeadTemperature', 'Row', 'Column', 'FilamentColor', 'Column', 'FanRelation']);
      expect(root.children[1]).toMatchObject({ type: 'Group', relation: 'summary', layoutSource: source, defaultRule: 'summary-grid6-v1' });
      expect(resolved.filter(({ type }) => type === 'Row').every(({ props }) => props.collapse === 'intrinsic')).toBe(true);
      expect(resolved.filter(({ type }) => type === 'Column').map(({ props }) => props.colSpan)).toEqual([6, 3, 3]);
      expect(resolved.filter(({ type }) => type === 'Group').map(({ props }) => props.label)).toEqual(['Tool identity', 'Tool summary']);
      expect(resolved.find(({ type }) => type === 'Title')?.props.inset).toBe(false);
      expect(resolved.filter(({ type }) => ['HeadTemperature', 'FilamentColor', 'FanRelation'].includes(type)).map(({ props }) => props.density)).toEqual(['compact', 'compact', 'compact']);
    }
  });
});
