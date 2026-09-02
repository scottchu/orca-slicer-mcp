import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { parse } from 'svelte/compiler';

// Explicit migration frontier: new files are rejected until assigned a layer.
export const composites = ['camera/CameraLabRoot.svelte', 'camera/CameraLabWidget.svelte', 'observation/ThermalsWidget.svelte', 'observation/ActualTarget.svelte', 'observation/ThermalReading.svelte', 'observation/ThermalsSkeleton.svelte', 'observation/FansWidget.svelte', 'observation/FanReading.svelte', 'observation/FansSkeleton.svelte', 'observation/ObservationSkeleton.svelte'];
composites.push('observation/FanReadings.svelte', 'live/LiveObservationRoot.svelte');
composites.push('observation/ThermalReadings.svelte', 'live/LiveThermalsRoot.svelte');
composites.push('camera/CameraWidget.svelte', 'camera/LiveCameraRoot.svelte');
composites.push('bed-mesh/BedMeshLabRoot.svelte');
composites.push('observation/HeadCard.svelte', 'observation/HeadCards.svelte', 'observation/HeadsSkeleton.svelte');
composites.push('observation/HeadsPanel.svelte', 'live/LiveHeadsRoot.svelte');
composites.push('observation/HeadsWidget.svelte');
composites.push('observation/QueueWidget.svelte', 'observation/QueueRow.svelte', 'observation/QueueRows.svelte', 'observation/QueueSummary.svelte', 'observation/QueueSkeleton.svelte', 'observation/DomainReceipt.svelte', 'live/LiveQueueRoot.svelte');
export const leaves: Record<string, string[]> = {
  'common/RetainedLayer.svelte': ['div'],
  'common/StateSurface/StateSurface.svelte': ['div'],
  'common/StateSurface/StaticStateSurface.svelte': ['div'],
  'common/CardGrid.svelte': ['div'], 'common/InsetCard.svelte': ['section', 'div', 'div', 'div', 'div'], 'common/ColorSwatch.svelte': ['span'],
  'common/Switch.svelte': ['div', 'span', 'span', 'button'],
  'common/OrderedRecords.svelte': ['ol'], 'common/Record.svelte': ['li', 'span', 'div'],
  'common/DateTimeValue.svelte': ['span', 'time'], 'common/DurationValue.svelte': ['span'],
  'common/MediaStatus.svelte': ['div', 'span', 'span', 'span'],
  'common/Video.svelte': ['div', 'div', 'div', 'div', 'div', 'div', 'img', 'video'],
  'common/PageLayout.svelte': ['main'],
  'lab/ObservationLabPage.svelte': ['main', 'section'],
  'camera/CameraMedia.svelte': ['canvas', 'div', 'div', 'div', 'div', 'div', 'video'],
  'camera/CameraStatus.svelte': ['div', 'span', 'span', 'span'],
  'common/LoadingValue.svelte': ['span', 'span'],
  'common/TextSkeleton.svelte': ['span'], 'common/ColorValue.svelte': ['span', 'span', 'span'],
  'lab/LabControls.svelte': ['fieldset', 'legend', 'div', 'label', 'span', 'select', 'option'],
  'common/Icon.svelte': ['span'], 'common/Label.svelte': ['span'],
  'common/CircleLabel.svelte': ['span'], 'common/BoxLabel.svelte': ['span'], 'common/Name.svelte': ['span'],
  'common/Caption.svelte': ['span'], 'common/Timestamp.svelte': ['span', 'time'], 'common/DegreeValue.svelte': ['span'],
  'common/Inline.svelte': ['span'], 'common/ReadingList.svelte': ['div'], 'common/ReadingRow.svelte': ['div'],
  'common/Skeleton.svelte': ['span'], 'common/StateAnnouncement.svelte': ['span'], 'observation/StatePanel.svelte': ['p'],
  'common/PercentageBackground.svelte': ['div'],
  'common/Stack.svelte': ['div'], 'common/InfoPair.svelte': ['div', 'span'], 'common/MetricValue.svelte': ['span'],
  'common/FeedbackOverlay.svelte': ['div'], 'observation/ObservedMeta.svelte': ['span'],
  'common/Shell.svelte': ['article'], 'common/Body.svelte': ['div'],
  'common/Header.svelte': ['div', 'div', 'div', 'div', 'h1', 'header'],
  'common/Footer.svelte': ['div', 'div', 'footer', 'span'], 'common/Button.svelte': ['button'],
  'common/ChartFrame.svelte': ['div', 'div', 'div', 'div', 'div', 'span'],
  'common/HeightLegend.svelte': ['div', 'span', 'span', 'span', 'span'],
  'bed-mesh/BedMesh2D.svelte': ['canvas'], 'bed-mesh/BedMesh3D.svelte': ['div', 'span', 'div', 'div'],
};
// Untouched ready widgets, route chrome, and compatibility frame remain explicit
// debt. Exact tag multisets cannot grow. Retire entries when migrated.
export const debt: Record<string, string[]> = {
  'observation/OverviewWidget.svelte': ['div','div','div','div','div','div','div','div','div','small','small','small','small','small','small','small','small','span','span','span','span','span','span','span','span','strong','strong','strong','strong','strong','strong','strong','strong'],
  'observation/ProgressWidget.svelte': ['div','div','div','div','div','div','div','span','span','span','span','span','strong','strong'],
  'observation/CurrentJobWidget.svelte': ['div','div','div','div','div','div','div','span','span','span','span','span','span','strong','strong','strong','strong','strong'],
  'observation/JobHistoryWidget.svelte': ['div','div','div','div','span','span','strong'],
  'bed-mesh/BedMeshWidget.svelte': ['dd','dd','dd','div','div','div','div','dl','dt','dt','dt','span'],
  'observation/LabDirectory.svelte': ['a','div','div','h1','header','main','nav','p','span'],
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
  'observation/QueueWidget.svelte': ['./ObservationFrame.svelte', './types', './loading', '../common/Stack.svelte', '../common/Caption.svelte', './QueueSummary.svelte', './QueueRows.svelte', './QueueSkeleton.svelte', '../lab/queue-shapes'],
  'observation/QueueRow.svelte': ['../live/queue-presentation', '../common/Record.svelte', '../common/BoxLabel.svelte', '../common/Name.svelte', '../common/Caption.svelte', '../common/LoadingValue.svelte', '../common/DateTimeValue.svelte', '../common/DurationValue.svelte'],
  'observation/QueueRows.svelte': ['../live/queue-presentation', '../common/OrderedRecords.svelte', './QueueRow.svelte'],
  'observation/QueueSkeleton.svelte': ['../common/OrderedRecords.svelte', './QueueRow.svelte', '../common/LoadingValue.svelte', '../common/Caption.svelte', './loading'],
  'observation/QueueSummary.svelte': ['../live/queue-presentation', '../common/InfoPair.svelte', '../common/Caption.svelte', '../common/LoadingValue.svelte', './format'],
  'observation/DomainReceipt.svelte': ['../live/presentation', '../common/Caption.svelte', './ObservedMeta.svelte', './format'],
  'live/LiveQueueRoot.svelte': ['../common/LoadingValue.svelte', 'svelte', 'lucide-svelte', './queue-controller', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../observation/DomainReceipt.svelte', '../observation/QueueSummary.svelte', '../observation/QueueRows.svelte', '../observation/QueueSkeleton.svelte'],
  'observation/HeadsWidget.svelte': ['svelte', './types', './loading', '../live/copy-action', '../live/heads-presentation', '../common/clipboard', './HeadsPanel.svelte', './heads-loading'],
  'live/LiveHeadsRoot.svelte': ['svelte', './heads-controller', './heads-presentation', '../observation/HeadsPanel.svelte'],
  'observation/HeadsPanel.svelte': ['lucide-svelte', '../live/presentation', '../live/heads-presentation', './format', './HeadCards.svelte', './HeadsSkeleton.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', './ObservedMeta.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte', './heads-loading'],
  'observation/HeadCard.svelte': ['lucide-svelte', '../live/heads-presentation', '../common/InsetCard.svelte', '../common/ColorValue.svelte', '../common/Inline.svelte', '../common/Stack.svelte', '../common/Name.svelte', '../common/Caption.svelte', '../common/LoadingValue.svelte', '../common/TextSkeleton.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', './ActualTarget.svelte', './heads-loading'],
  'observation/HeadCards.svelte': ['../live/heads-presentation', '../common/CardGrid.svelte', './HeadCard.svelte', './heads-loading'],
  'observation/HeadsSkeleton.svelte': ['./HeadCards.svelte', './heads-loading'],
  'observation/ThermalReadings.svelte': ['../live/presentation', '../common/ReadingList.svelte', './ThermalReading.svelte'],
  'live/LiveThermalsRoot.svelte': ['svelte', 'lucide-svelte', './thermals-controller', '../observation/format', '../observation/ThermalReadings.svelte', '../observation/ThermalsSkeleton.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', '../observation/ObservedMeta.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte'],
  'camera/LiveCameraRoot.svelte': ['./CameraWidget.svelte', './session', '../media/playback', './runtime'],
  'camera/CameraWidget.svelte': ['../common/Switch.svelte', './mode-options', 'lucide-svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/StateAnnouncement.svelte', '../common/MediaStatus.svelte', '../common/Video.svelte', '../media/playback', './session'],
  'camera/CameraLabRoot.svelte': ['svelte', './CameraLabWidget.svelte', '../lab/LabControls.svelte', '../common/PageLayout.svelte', './controller', './lab-location'],
  'camera/CameraLabWidget.svelte': ['../common/Switch.svelte', './mode-options', './session', '../common/Icon.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Caption.svelte', '../common/StateAnnouncement.svelte', './CameraStatus.svelte', './CameraMedia.svelte', './state'],
  'bed-mesh/BedMeshLabRoot.svelte': ['svelte', '../lab/LabControls.svelte', '../lab/ObservationLabPage.svelte', '../lab/bed-mesh-fixture', './lab-controller', './lab-location', './BedMeshWidget.svelte'],
  'observation/ObservationSkeleton.svelte': ['./types', './OverviewWidget.svelte', './ProgressWidget.svelte', './HeadsWidget.svelte', './CurrentJobWidget.svelte', './JobHistoryWidget.svelte', './QueueWidget.svelte', './heads-loading', './loading'],
  'observation/FansWidget.svelte': ['./ObservationFrame.svelte', './types', './format', './state', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte', './loading', './FanReadings.svelte', './FansSkeleton.svelte'],
  'observation/FanReadings.svelte': ['../live/presentation', '../common/ReadingList.svelte', './FanReading.svelte'],
  'live/LiveObservationRoot.svelte': ['svelte', 'lucide-svelte', './controller', '../observation/format', '../observation/FanReadings.svelte', '../observation/FansSkeleton.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', '../observation/ObservedMeta.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte'],
  'observation/FanReading.svelte': ['./types', './fan-labels', '../common/PercentageBackground.svelte', '../common/ReadingRow.svelte', '../common/Inline.svelte', '../common/Icon.svelte', '../common/Name.svelte', '../common/MetricValue.svelte'],
  'observation/FansSkeleton.svelte': ['./fan-labels', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte', '../common/Skeleton.svelte', '../common/ReadingList.svelte', '../common/ReadingRow.svelte', '../common/Inline.svelte', '../common/Icon.svelte', '../common/Name.svelte', '../common/MetricValue.svelte'],
  'observation/ThermalsWidget.svelte': ['./ObservationFrame.svelte', './types', './state', './loading', './ThermalReadings.svelte', './ThermalsSkeleton.svelte'],
  'observation/ActualTarget.svelte': ['../common/DegreeValue.svelte', '../common/Inline.svelte', '../common/Label.svelte'],
  'observation/ThermalReading.svelte': ['../live/presentation', './ActualTarget.svelte', '../common/Icon.svelte', '../common/Inline.svelte', '../common/Name.svelte', '../common/ReadingRow.svelte', '../common/PercentageBackground.svelte'],
  'observation/ThermalsSkeleton.svelte': ['../common/ReadingList.svelte', './ThermalReading.svelte'],
};
// Explicit shared footer/state contract.
approvedImports['camera/CameraWidget.svelte'].push('../common/Footer.svelte', '../common/StateSurface/StaticStateSurface.svelte', '../common/Skeleton.svelte');
approvedImports['camera/CameraLabWidget.svelte'].push('lucide-svelte', '../common/Button.svelte', '../common/Footer.svelte', '../common/StateSurface/StaticStateSurface.svelte', '../common/Skeleton.svelte');

for (const name of ['observation/FanReading.svelte', 'observation/FansSkeleton.svelte', 'observation/ThermalReading.svelte']) approvedImports[name].push('./icons');
for (const name of ['live/LiveObservationRoot.svelte', 'live/LiveThermalsRoot.svelte', 'live/LiveQueueRoot.svelte']) approvedImports[name].push('../observation/icons');

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
    if (name.startsWith('common/') && /from\s+['"][^'"]*(?:observation|bed-mesh)\//.test(source)) failures.push(`${name}: leaf imports feature`);
  }
  return failures;
}
