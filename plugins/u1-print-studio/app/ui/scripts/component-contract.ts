import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { parse } from 'svelte/compiler';

// Explicit migration frontier: new files are rejected until assigned a layer.
export const composites = ['observation/ThermalsWidget.svelte', 'observation/ActualTarget.svelte', 'observation/ThermalReading.svelte', 'observation/ThermalsSkeleton.svelte', 'observation/FansWidget.svelte', 'observation/FanReading.svelte', 'observation/FansSkeleton.svelte', 'observation/ObservationSkeleton.svelte', 'observation/ObservationState.svelte'];
export const leaves: Record<string, string[]> = {
  'ui/LoadingValue.svelte': ['span'],
  'ui/LabControls.svelte': ['fieldset', 'legend', 'div', 'label', 'span', 'select', 'option'],
  'ui/Icon.svelte': [], 'ui/BorderedIcon.svelte': ['span'], 'ui/Label.svelte': ['span'],
  'ui/CircleLabel.svelte': ['span'], 'ui/BoxLabel.svelte': ['span'], 'ui/Name.svelte': ['span'],
  'ui/Caption.svelte': ['span'], 'ui/Timestamp.svelte': ['span', 'time'], 'ui/DegreeValue.svelte': ['span'],
  'ui/Inline.svelte': ['span'], 'ui/ReadingList.svelte': ['div'], 'ui/ReadingRow.svelte': ['div'],
  'ui/Skeleton.svelte': ['span'], 'ui/StateAnnouncement.svelte': ['span'], 'ui/StatePanel.svelte': ['p'],
  'ui/PercentageBackground.svelte': ['div'],
  'ui/Stack.svelte': ['div'], 'ui/InfoPair.svelte': ['div', 'span'], 'ui/MetricValue.svelte': ['span'],
  'ui/FeedbackOverlay.svelte': ['div'], 'ui/ObservedMeta.svelte': ['span'],
  'ui/WidgetShell.svelte': ['article'], 'ui/WidgetBody.svelte': ['div'],
  'ui/WidgetHeader.svelte': ['div', 'div', 'div', 'div', 'h1', 'header'],
  'ui/WidgetFooter.svelte': ['div', 'div', 'footer'], 'ui/IconButton.svelte': ['button'],
  'ui/ChartFrame.svelte': ['div', 'div', 'div'],
  'bed-mesh/BedMesh2D.svelte': ['canvas'], 'bed-mesh/BedMesh3D.svelte': Array(11).fill('div'),
};
// Untouched ready widgets, route chrome, and compatibility frame remain explicit
// debt. Exact tag multisets cannot grow. Retire entries when migrated.
export const debt: Record<string, string[]> = {
  'observation/OverviewWidget.svelte': ['div','div','div','div','div','div','div','div','div','small','small','small','small','small','small','small','small','span','span','span','span','span','span','span','span','strong','strong','strong','strong','strong','strong','strong','strong'],
  'observation/ProgressWidget.svelte': ['div','div','div','div','div','div','div','span','span','span','span','span','strong','strong'],
  'observation/HeadsWidget.svelte': ['button','div','div','div','div','div','section','span','span','span','span','span','strong'],
  'observation/CurrentJobWidget.svelte': ['div','div','div','div','div','div','div','span','span','span','span','span','span','strong','strong','strong','strong','strong'],
  'observation/JobHistoryWidget.svelte': ['div','div','div','div','span','span','strong'],
  'observation/QueueWidget.svelte': ['div','div','div','div','div','span','span','span','span','span','strong','strong'],
  'bed-mesh/BedMeshWidget.svelte': ['dd','dd','dd','div','div','div','div','div','div','div','dl','dt','dt','dt','span','span','span','span'],
  'observation/LabDirectory.svelte': ['a','div','div','div','div','h1','header','main','nav','p','span','span','strong'],
  'observation/ObservationFrame.svelte': [],
  '../routes/+page.svelte': ['div','main','section','section'], '../routes/+layout.svelte': [],
};

export function exactTags(actual: string[], expected: string[]): boolean {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

type Node = { type?: string; name?: string; [key: string]: unknown };
function visit(value: unknown, fn: (node: Node) => void): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach((item) => visit(item, fn)); return; }
  const node = value as Node;
  fn(node);
  for (const [key, child] of Object.entries(node)) if (key !== 'loc' && key !== 'name_loc') visit(child, fn);
}

const approvedImports: Record<string, string[]> = {
  'observation/ObservationSkeleton.svelte': ['./types', './OverviewWidget.svelte', './ProgressWidget.svelte', './HeadsWidget.svelte', './CurrentJobWidget.svelte', './JobHistoryWidget.svelte', './QueueWidget.svelte', '../bed-mesh/BedMeshWidget.svelte'],
  'observation/ObservationState.svelte': ['./types', './ObservationFrame.svelte', '../ui/StatePanel.svelte'],
  'observation/FansWidget.svelte': ['./ObservationFrame.svelte', './types', './format', '../ui/state', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte', '../ui/ReadingList.svelte', '../ui/StatePanel.svelte', './FanReading.svelte', './FansSkeleton.svelte'],
  'observation/FanReading.svelte': ['./types', './fan-labels', '../ui/PercentageBackground.svelte', '../ui/ReadingRow.svelte', '../ui/Inline.svelte', '../ui/Icon.svelte', '../ui/Name.svelte', '../ui/MetricValue.svelte'],
  'observation/FansSkeleton.svelte': ['./fan-labels', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte', '../ui/Skeleton.svelte', '../ui/ReadingList.svelte', '../ui/ReadingRow.svelte', '../ui/Inline.svelte', '../ui/Icon.svelte', '../ui/Name.svelte', '../ui/MetricValue.svelte'],
  'observation/ThermalsWidget.svelte': ['./ObservationFrame.svelte', './types', '../ui/state', '../ui/ReadingList.svelte', '../ui/StatePanel.svelte', './ThermalReading.svelte', './ThermalsSkeleton.svelte'],
  'observation/ActualTarget.svelte': ['../ui/DegreeValue.svelte', '../ui/Inline.svelte', '../ui/Label.svelte'],
  'observation/ThermalReading.svelte': ['./types', './ActualTarget.svelte', '../ui/Icon.svelte', '../ui/Inline.svelte', '../ui/Name.svelte', '../ui/ReadingRow.svelte', '../ui/PercentageBackground.svelte'],
  'observation/ThermalsSkeleton.svelte': ['../ui/Inline.svelte', '../ui/ReadingList.svelte', '../ui/ReadingRow.svelte', '../ui/Skeleton.svelte'],
};
export function inspectComponent(source: string, strict: boolean, imports: string[] = []): { tags: string[]; violations: string[] } {
  const ast = parse(source, { modern: true });
  const tags: string[] = [];
  const violations: string[] = [];
  const components = new Set<string>();
  visit(ast, (node) => {
    if (node.type !== 'ImportDeclaration') return;
    const from = (node.source as { value: string }).value;
    if (!imports.includes(from) || !from.endsWith('.svelte')) return;
    for (const specifier of node.specifiers as { type: string; local: { name: string } }[]) {
      if (specifier.type === 'ImportDefaultSpecifier') components.add(specifier.local.name);
    }
  });
  if (strict && ast.css) violations.push('style block');
  visit(ast, (node) => {
    if (node.type === 'RegularElement') { tags.push(node.name!); if (strict) violations.push(`native ${node.name}`); }
    if (!strict) return;
    if (node.type === 'HtmlTag' || node.type === 'RenderTag' || node.type === 'SpreadAttribute' || node.type?.startsWith('Svelte')) violations.push(`escape ${node.type}`);
    if (node.type === 'ClassDirective' || node.type === 'StyleDirective' || (node.type === 'Attribute' && /^(class|style)$/.test(node.name!))) violations.push('styling escape');
    if (node.type === 'Component' && !components.has(node.name!)) violations.push(`unregistered component ${node.name}`);
    if (node.type === 'ImportExpression') violations.push('dynamic import');
    if (node.type === 'ImportDeclaration') {
      const from = (node.source as { value: string }).value;
      if (!imports.includes(from)) violations.push(`unapproved import ${from}`);
    }
    if (node.type === 'Identifier' && ['fetch', 'WebSocket', 'XMLHttpRequest', 'RTCPeerConnection', 'postMessage', 'openai', 'window', 'document', 'navigator', 'globalThis', 'self', 'eval', 'Function', 'require'].includes(node.name!)) violations.push(`transport/global ${node.name}`);
  });
  return { tags: tags.sort(), violations };
}

export function checkComponents(root: string): string[] {
  const failures: string[] = [];
  const files: string[] = [];
  function scan(folder: string): void {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const file = resolve(folder, entry.name);
      if (entry.isDirectory()) scan(file); else if (file.endsWith('.svelte')) files.push(file);
    }
  }
  scan(root); scan(resolve(root, '../routes'));
  for (const file of files) {
    const name = relative(root, file);
    const strict = composites.includes(name);
    if (!strict && !(name in leaves) && !(name in debt)) { failures.push(`${name}: unregistered component`); continue; }
    const source = readFileSync(file, 'utf8');
    const result = inspectComponent(source, strict, approvedImports[name]);
    failures.push(...result.violations.map((message) => `${name}: ${message}`));
    if (name in leaves && !exactTags(result.tags, leaves[name])) failures.push(`${name}: leaf native tags changed`);
    if (name in debt && !exactTags(result.tags, debt[name])) failures.push(`${name}: raw debt tag multiset changed`);
    if (name.startsWith('ui/') && /from\s+['"][^'"]*(?:observation|bed-mesh)\//.test(source)) failures.push(`${name}: leaf imports feature`);
  }
  return failures;
}
