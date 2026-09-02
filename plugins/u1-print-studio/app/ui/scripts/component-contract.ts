import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { parse } from 'svelte/compiler';

// Explicit migration frontier: new files are rejected until assigned a layer.
export const composites = ['camera/CameraLabRoot.svelte', 'camera/CameraLabWidget.svelte', 'observation/ThermalsWidget.svelte', 'observation/ActualTarget.svelte', 'observation/ThermalReading.svelte', 'observation/ThermalsSkeleton.svelte', 'observation/FansWidget.svelte', 'observation/FanReading.svelte', 'observation/FansSkeleton.svelte', 'observation/ObservationSkeleton.svelte', 'observation/ObservationState.svelte'];
composites.push('observation/FanReadings.svelte', 'live/LiveObservationRoot.svelte');
composites.push('observation/ThermalReadings.svelte', 'live/LiveThermalsRoot.svelte');
composites.push('camera/CameraWidget.svelte', 'camera/LiveCameraRoot.svelte');
composites.push('bed-mesh/BedMeshLabRoot.svelte');
composites.push('observation/HeadCard.svelte', 'observation/HeadCards.svelte', 'observation/HeadsSkeleton.svelte');
composites.push('observation/HeadsPanel.svelte', 'live/LiveHeadsRoot.svelte');
composites.push('observation/HeadsWidget.svelte');
composites.push('observation/QueueWidget.svelte', 'observation/QueueRow.svelte', 'observation/QueueRows.svelte', 'observation/QueueSummary.svelte', 'observation/QueueSkeleton.svelte', 'observation/DomainReceipt.svelte', 'live/LiveQueueRoot.svelte');
export const leaves: Record<string, string[]> = {
  'ui/CardGrid.svelte': ['div'], 'ui/InsetCard.svelte': ['section', 'div', 'div', 'div', 'div'], 'ui/ColorSwatch.svelte': ['span'],
  'ui/IconSegmentedControl.svelte': ['div', 'span', 'span', 'button'],
  'ui/OrderedRecords.svelte': ['ol'], 'ui/Record.svelte': ['li', 'span', 'div'],
  'ui/DateTimeValue.svelte': ['span', 'time'], 'ui/DurationValue.svelte': ['span'],
  'media/MediaStatus.svelte': ['div', 'span', 'span', 'span'],
  'media/VideoSurface.svelte': ['div', 'div', 'div', 'div', 'div', 'div', 'img', 'video'],
  'ui/PageLayout.svelte': ['main'],
  'ui/ObservationLabPage.svelte': ['main', 'section'],
  'camera/CameraMedia.svelte': ['canvas', 'div', 'div', 'div', 'div', 'div', 'video'],
  'camera/CameraStatus.svelte': ['div', 'span', 'span', 'span'],
  'ui/LoadingValue.svelte': ['span', 'span'],
  'ui/TextSkeleton.svelte': ['span'],
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
  'ui/ChartFrame.svelte': ['div', 'div', 'div', 'div', 'div', 'span'],
  'ui/HeightLegend.svelte': ['div', 'span', 'span', 'span', 'span'],
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
  'observation/QueueWidget.svelte': ['./ObservationFrame.svelte', './types', './loading', '../ui/Stack.svelte', '../ui/Caption.svelte', './QueueSummary.svelte', './QueueRows.svelte', './QueueSkeleton.svelte', '../lab/queue-shapes'],
  'observation/QueueRow.svelte': ['../live/queue-presentation', '../ui/Record.svelte', '../ui/BoxLabel.svelte', '../ui/Name.svelte', '../ui/Caption.svelte', '../ui/LoadingValue.svelte', '../ui/DateTimeValue.svelte', '../ui/DurationValue.svelte'],
  'observation/QueueRows.svelte': ['../live/queue-presentation', '../ui/OrderedRecords.svelte', './QueueRow.svelte'],
  'observation/QueueSkeleton.svelte': ['../ui/OrderedRecords.svelte', './QueueRow.svelte', '../ui/LoadingValue.svelte', '../ui/Caption.svelte', './loading'],
  'observation/QueueSummary.svelte': ['../live/queue-presentation', '../ui/InfoPair.svelte', '../ui/Caption.svelte', '../ui/LoadingValue.svelte', './format'],
  'observation/DomainReceipt.svelte': ['../live/presentation', '../ui/Caption.svelte', '../ui/ObservedMeta.svelte', './format'],
  'live/LiveQueueRoot.svelte': ['svelte', 'lucide-svelte', './queue-controller', '../ui/WidgetShell.svelte', '../ui/WidgetHeader.svelte', '../ui/WidgetBody.svelte', '../ui/WidgetFooter.svelte', '../ui/StateAnnouncement.svelte', '../ui/StatePanel.svelte', '../ui/Caption.svelte', '../ui/Icon.svelte', '../ui/IconButton.svelte', '../ui/Skeleton.svelte', '../ui/FeedbackOverlay.svelte', '../ui/Stack.svelte', '../observation/DomainReceipt.svelte', '../observation/QueueSummary.svelte', '../observation/QueueRows.svelte', '../observation/QueueSkeleton.svelte'],
  'observation/HeadsWidget.svelte': ['svelte', './types', './loading', '../live/copy-action', '../live/heads-presentation', '../ui/clipboard', './HeadsPanel.svelte'],
  'live/LiveHeadsRoot.svelte': ['svelte', './heads-controller', './heads-presentation', '../observation/HeadsPanel.svelte'],
  'observation/HeadsPanel.svelte': ['lucide-svelte', '../live/presentation', '../live/heads-presentation', './format', './HeadCards.svelte', './HeadsSkeleton.svelte', '../ui/WidgetShell.svelte', '../ui/WidgetHeader.svelte', '../ui/WidgetBody.svelte', '../ui/WidgetFooter.svelte', '../ui/StateAnnouncement.svelte', '../ui/StatePanel.svelte', '../ui/ObservedMeta.svelte', '../ui/Caption.svelte', '../ui/Icon.svelte', '../ui/IconButton.svelte', '../ui/Skeleton.svelte', '../ui/FeedbackOverlay.svelte', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte'],
  'observation/HeadCard.svelte': ['lucide-svelte', '../live/heads-presentation', '../ui/InsetCard.svelte', '../ui/ColorSwatch.svelte', '../ui/Inline.svelte', '../ui/Stack.svelte', '../ui/Name.svelte', '../ui/Caption.svelte', '../ui/LoadingValue.svelte', '../ui/Icon.svelte', '../ui/IconButton.svelte', '../ui/Skeleton.svelte', './ActualTarget.svelte'],
  'observation/HeadCards.svelte': ['../live/heads-presentation', '../ui/CardGrid.svelte', './HeadCard.svelte'],
  'observation/HeadsSkeleton.svelte': ['./HeadCards.svelte'],
  'observation/ThermalReadings.svelte': ['../live/presentation', '../ui/ReadingList.svelte', './ThermalReading.svelte'],
  'live/LiveThermalsRoot.svelte': ['svelte', 'lucide-svelte', './thermals-controller', '../observation/format', '../observation/ThermalReadings.svelte', '../observation/ThermalsSkeleton.svelte', '../ui/WidgetShell.svelte', '../ui/WidgetHeader.svelte', '../ui/WidgetBody.svelte', '../ui/WidgetFooter.svelte', '../ui/StateAnnouncement.svelte', '../ui/StatePanel.svelte', '../ui/ObservedMeta.svelte', '../ui/Caption.svelte', '../ui/Icon.svelte', '../ui/IconButton.svelte', '../ui/Skeleton.svelte', '../ui/FeedbackOverlay.svelte', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte'],
  'camera/LiveCameraRoot.svelte': ['./CameraWidget.svelte', './session', '../media/playback', './runtime'],
  'camera/CameraWidget.svelte': ['lucide-svelte', '../ui/Icon.svelte', '../ui/IconButton.svelte', '../ui/WidgetShell.svelte', '../ui/WidgetHeader.svelte', '../ui/WidgetBody.svelte', '../ui/StateAnnouncement.svelte', '../media/MediaStatus.svelte', '../media/VideoSurface.svelte', '../media/playback', './session'],
  'camera/CameraLabRoot.svelte': ['svelte', './CameraLabWidget.svelte', '../ui/LabControls.svelte', '../ui/PageLayout.svelte', './controller', './lab-location'],
  'camera/CameraLabWidget.svelte': ['../ui/Icon.svelte', '../ui/WidgetShell.svelte', '../ui/WidgetHeader.svelte', '../ui/WidgetBody.svelte', '../ui/Caption.svelte', '../ui/StateAnnouncement.svelte', './CameraStatus.svelte', './CameraMedia.svelte', './state'],
  'bed-mesh/BedMeshLabRoot.svelte': ['svelte', '../ui/LabControls.svelte', '../ui/ObservationLabPage.svelte', '../observation/ObservationState.svelte', '../lab/bed-mesh-fixture', './lab-controller', './lab-location', './BedMeshWidget.svelte'],
  'observation/ObservationSkeleton.svelte': ['./types', './OverviewWidget.svelte', './ProgressWidget.svelte', './HeadsWidget.svelte', './CurrentJobWidget.svelte', './JobHistoryWidget.svelte', './QueueWidget.svelte'],
  'observation/ObservationState.svelte': ['./types', './ObservationFrame.svelte', '../ui/StatePanel.svelte'],
  'observation/FansWidget.svelte': ['./ObservationFrame.svelte', './types', './format', '../ui/state', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte', '../ui/StatePanel.svelte', './FanReadings.svelte', './FansSkeleton.svelte'],
  'observation/FanReadings.svelte': ['../live/presentation', '../ui/ReadingList.svelte', './FanReading.svelte'],
  'live/LiveObservationRoot.svelte': ['svelte', 'lucide-svelte', './controller', '../observation/format', '../observation/FanReadings.svelte', '../observation/FansSkeleton.svelte', '../ui/WidgetShell.svelte', '../ui/WidgetHeader.svelte', '../ui/WidgetBody.svelte', '../ui/WidgetFooter.svelte', '../ui/StateAnnouncement.svelte', '../ui/StatePanel.svelte', '../ui/ObservedMeta.svelte', '../ui/Caption.svelte', '../ui/Icon.svelte', '../ui/IconButton.svelte', '../ui/Skeleton.svelte', '../ui/FeedbackOverlay.svelte', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte'],
  'observation/FanReading.svelte': ['./types', './fan-labels', '../ui/PercentageBackground.svelte', '../ui/ReadingRow.svelte', '../ui/Inline.svelte', '../ui/Icon.svelte', '../ui/Name.svelte', '../ui/MetricValue.svelte'],
  'observation/FansSkeleton.svelte': ['./fan-labels', '../ui/Stack.svelte', '../ui/InfoPair.svelte', '../ui/Label.svelte', '../ui/Skeleton.svelte', '../ui/ReadingList.svelte', '../ui/ReadingRow.svelte', '../ui/Inline.svelte', '../ui/Icon.svelte', '../ui/Name.svelte', '../ui/MetricValue.svelte'],
  'observation/ThermalsWidget.svelte': ['./ObservationFrame.svelte', './types', '../ui/state', '../ui/StatePanel.svelte', './ThermalReadings.svelte', './ThermalsSkeleton.svelte'],
  'observation/ActualTarget.svelte': ['../ui/DegreeValue.svelte', '../ui/Inline.svelte', '../ui/Label.svelte'],
  'observation/ThermalReading.svelte': ['../live/presentation', './ActualTarget.svelte', '../ui/Icon.svelte', '../ui/Inline.svelte', '../ui/Name.svelte', '../ui/ReadingRow.svelte', '../ui/PercentageBackground.svelte'],
  'observation/ThermalsSkeleton.svelte': ['../ui/ReadingList.svelte', './ThermalReading.svelte'],
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
