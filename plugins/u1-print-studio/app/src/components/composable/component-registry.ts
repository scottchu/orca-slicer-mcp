import type { Component, ComponentProps } from 'svelte';
import type {
  PresentationAdapterPropsByElement,
  PresentationComponentPropsByElement,
  PresentationRenderContext,
} from '../../lib/client/composable/component-props';
import {
  elementRegistry,
  type PresentationElementRole,
  type PresentationElementType,
} from '../../lib/composable/element-registry';
import type { ResolvedNode } from '../../lib/composable/view-model';
import Card from '../common/Card.svelte';
import Grid from '../common/Grid.svelte';
import Inline from '../common/Inline.svelte';
import Stack from '../common/Stack.svelte';
import Title from '../common/Title.svelte';
import FanRelation from './FanRelation.svelte';
import FilamentColor from './FilamentColor.svelte';
import HeadStatus from './HeadStatus.svelte';
import HeadTemperature from './HeadTemperature.svelte';

type ResolvedNodeByElement = {
  [Type in PresentationElementType]: Extract<ResolvedNode, { type: Type }>;
};
type ActualComponentPropsByElement = {
  Card: ComponentProps<typeof Card>;
  Title: ComponentProps<typeof Title>;
  Stack: ComponentProps<typeof Stack>;
  Grid: ComponentProps<typeof Grid>;
  Inline: ComponentProps<typeof Inline>;
  HeadStatus: ComponentProps<typeof HeadStatus>;
  HeadTemperature: ComponentProps<typeof HeadTemperature>;
  FilamentColor: ComponentProps<typeof FilamentColor>;
  FanRelation: ComponentProps<typeof FanRelation>;
};
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? (<Value>() => Value extends Right ? 1 : 2) extends
      (<Value>() => Value extends Left ? 1 : 2) ? true : false
    : false;
type ContractChecks = {
  [Type in PresentationElementType]: Equal<
    ActualComponentPropsByElement[Type],
    PresentationComponentPropsByElement[Type]
  >;
};
type RoleFor<Type extends PresentationElementType> = (typeof elementRegistry)[Type]['role'];
type ChildReader<Type extends PresentationElementType> =
  RoleFor<Type> extends 'root' | 'layout'
    ? (node: ResolvedNodeByElement[Type]) => readonly ResolvedNode[]
    : null;

export type ResolvedRegisteredNode = {
  role: PresentationElementRole;
  component: Component<Record<string, unknown>>;
  props: Record<string, unknown>;
  children: readonly ResolvedNode[] | null;
};

type RegisteredComponentEntry<Type extends PresentationElementType> = {
  type: Type;
  role: RoleFor<Type>;
  component: Component<PresentationComponentPropsByElement[Type]>;
  getProps: (
    node: ResolvedNodeByElement[Type],
    context: PresentationRenderContext,
  ) => PresentationAdapterPropsByElement[Type];
  getChildren: ChildReader<Type>;
  resolve: (node: ResolvedNode, context: PresentationRenderContext) => ResolvedRegisteredNode;
};

const defineComponentEntry = <Type extends PresentationElementType>(
  type: Type,
  component: Component<PresentationComponentPropsByElement[Type]>,
  getProps: RegisteredComponentEntry<Type>['getProps'],
  getChildren: ChildReader<Type>,
): RegisteredComponentEntry<Type> => {
  const role = elementRegistry[type].role as RoleFor<Type>;
  const resolve = (candidate: ResolvedNode, context: PresentationRenderContext): ResolvedRegisteredNode => {
    if (candidate.type !== type) throw new Error(`Registered component ${type} received ${candidate.type}`);
    const node = candidate as ResolvedNodeByElement[Type];
    const props = getProps(node, context);
    const children = getChildren === null ? null : getChildren(node);
    return {
      role,
      // Sole dynamic Svelte boundary, after component, node adapter, required
      // props and child policy agree in the typed entry above.
      component: component as unknown as Component<Record<string, unknown>>,
      props: props as unknown as Record<string, unknown>,
      children,
    };
  };
  return { type, role, component, getProps, getChildren, resolve };
};

/** Fails compilation when a component and its independent prop contract drift. */
export const componentRegistryContractChecks = {
  Card: true,
  Title: true,
  Stack: true,
  Grid: true,
  Inline: true,
  HeadStatus: true,
  HeadTemperature: true,
  FilamentColor: true,
  FanRelation: true,
} as const satisfies ContractChecks;

/** Static client entries own both the constructor and its typed props adapter. */
export const componentRegistry = {
  Card: defineComponentEntry('Card', Card, (node, context) => ({
    label: context.subjectLabel,
    busy: context.busy,
    tint: node.tint?.color ?? null,
    density: node.density,
  }), (node) => node.children),
  Title: defineComponentEntry('Title', Title, (node) => ({ text: node.text, size: node.size }), null),
  Stack: defineComponentEntry('Stack', Stack, (node) => ({ gap: node.gap, inset: true, composed: true }), (node) => node.children),
  Grid: defineComponentEntry('Grid', Grid, (node) => ({ columns: node.columns, gap: node.gap, inset: true, arrangement: node.arrangement }), (node) => node.children),
  Inline: defineComponentEntry('Inline', Inline, (node) => ({ gap: node.gap, distribution: node.distribution, inset: true, composed: true }), (node) => node.children),
  HeadStatus: defineComponentEntry('HeadStatus', HeadStatus, (node) => ({ value: node.value, appearance: node.appearance }), null),
  HeadTemperature: defineComponentEntry('HeadTemperature', HeadTemperature, (node) => ({ value: node.value, appearance: node.appearance }), null),
  FilamentColor: defineComponentEntry('FilamentColor', FilamentColor, (node) => ({ value: node.value, appearance: node.appearance }), null),
  FanRelation: defineComponentEntry('FanRelation', FanRelation, (node) => ({ value: node.value, appearance: node.appearance }), null),
} as const satisfies { [Type in PresentationElementType]: RegisteredComponentEntry<Type> };

export const resolveRegisteredNode = (
  node: ResolvedNode,
  context: PresentationRenderContext,
): ResolvedRegisteredNode => componentRegistry[node.type].resolve(node, context);
