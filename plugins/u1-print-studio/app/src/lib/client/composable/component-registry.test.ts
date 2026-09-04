import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { componentRegistry, componentRegistryContractChecks, resolveRegisteredNode } from '../../../components/composable/component-registry';
import { PRESENTATION_ELEMENT_TYPES } from '../../composable/element-registry';
import { t1EntityCardSpec } from '../../composable/specs';
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
      expect(registered.children === null).toBe(!['root', 'layout'].includes(registered.role));
      if (registered.role === 'domain') expect(registered.props).toHaveProperty('value');
    }

    const renderer = readFileSync(resolve(process.cwd(), 'src/components/composable/PresentationNode.svelte'), 'utf8');
    expect(renderer).not.toContain('node.type');
    for (const type of PRESENTATION_ELEMENT_TYPES) expect(renderer).not.toMatch(new RegExp(`\\b${type}\\b`, 'u'));
    expect(renderer).toContain("registered.role === 'root' || registered.role === 'layout'");
    expect(renderer).toContain('resolveRegisteredNode');
  });
});
