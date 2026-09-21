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
composites.push('mcp/ObservationRoot.svelte');
composites.push('observation/QueueWidget.svelte', 'observation/QueueRow.svelte', 'observation/QueueRows.svelte', 'observation/QueueSummary.svelte', 'observation/QueueSkeleton.svelte', 'observation/DomainReceipt.svelte', 'live/LiveQueueRoot.svelte');
composites.push('composable/PresentationNode.svelte', 'composable/PresentationRenderer.svelte', 'composable/ComposableMcpRoot.svelte', 'composable/HeadStatus.svelte', 'composable/HeadTemperature.svelte', 'composable/FilamentColor.svelte', 'composable/FanRelation.svelte');
export const leaves: Record<string, string[]> = {
  'common/Frame.svelte': [],
  'common/Mount.svelte': ['div'],
  'common/RetainedLayer.svelte': ['div'],
  'common/StateSurface/StateSurface.svelte': ['div'],
  'common/StateSurface/StaticStateSurface.svelte': ['div'],
  'common/CardGrid.svelte': ['div'], 'common/InsetCard.svelte': ['section', 'div', 'div', 'div', 'div'], 'common/ColorSwatch.svelte': ['span'],
  'common/Switch.svelte': ['div', 'span', 'span', 'button'],
  'common/OrderedRecords.svelte': ['ol'], 'common/Record.svelte': ['li', 'span', 'div'],
  'common/DateTimeValue.svelte': ['span', 'time'], 'common/DurationValue.svelte': ['span'],
  'common/MediaStatus.svelte': ['div', 'span', 'span', 'span', 'span'],
  'common/Video.svelte': ['div', 'div', 'div', 'div', 'div', 'div', 'div', 'div', 'img', 'video'],
  'common/PageLayout.svelte': ['main'],
  'lab/ObservationLabPage.svelte': ['main', 'section'],
  'camera/CameraMedia.svelte': ['canvas', 'div', 'div', 'div', 'div', 'div', 'div', 'div', 'video'],
  'camera/CameraStatus.svelte': ['div', 'span', 'span', 'span'],
  'common/LoadingValue.svelte': ['span', 'span'],
  'common/TextViewport.svelte': ['div', 'div', 'span', 'span', 'span'],
  'common/TextSkeleton.svelte': ['span'], 'common/ColorValue.svelte': ['span', 'span', 'span'],
  'lab/LabControls.svelte': ['fieldset', 'legend', 'div', 'label', 'span', 'select', 'option'],
  'common/Icon.svelte': ['span'], 'common/Label.svelte': ['span'],
  'common/CircleLabel.svelte': ['span'], 'common/BoxLabel.svelte': ['span'], 'common/Name.svelte': ['span'],
  'common/Caption.svelte': ['span'], 'common/Timestamp.svelte': ['span', 'time'], 'common/DegreeValue.svelte': ['span'],
  'common/Inline.svelte': ['span'], 'common/LayoutInline.svelte': ['div', 'span'], 'common/ReadingList.svelte': ['div'], 'common/ReadingRow.svelte': ['div'],
  'common/Skeleton.svelte': ['span'], 'common/StateAnnouncement.svelte': ['span'], 'observation/StatePanel.svelte': ['p'],
  'common/PercentageBackground.svelte': ['div'], 'common/Grid.svelte': ['div'],
  'common/Stack.svelte': ['div'], 'common/LayoutStack.svelte': ['div'], 'common/InfoPair.svelte': ['div', 'span'], 'common/MetricValue.svelte': ['span'],
  'common/FeedbackOverlay.svelte': ['div'], 'observation/ObservedMeta.svelte': ['span'],
  'common/Shell.svelte': ['article'], 'common/Body.svelte': ['div'],
  'common/Header.svelte': ['div', 'div', 'div', 'div', 'h1', 'header'],
  'common/Footer.svelte': ['div', 'div', 'footer', 'span'], 'common/Button.svelte': ['button'],
  'common/ChartFrame.svelte': ['div', 'div', 'div', 'div', 'div', 'span'],
  'common/HeightLegend.svelte': ['div', 'span', 'span', 'span', 'span'],
  'bed-mesh/BedMesh2D.svelte': ['canvas'], 'bed-mesh/BedMesh3D.svelte': ['div', 'span', 'div', 'div'],
  'common/Badge.svelte': ['div', 'span', 'span', 'span', 'span', 'span'], 'common/Card.svelte': ['article'],
  'common/Group.svelte': ['div', 'div', 'section', 'span'], 'common/Column.svelte': ['div'],
  'common/Metric.svelte': ['div', 'span', 'span', 'span', 'span', 'span'], 'common/Row.svelte': ['div'],
  'common/Swatch.svelte': ['div', 'span', 'span', 'span', 'span', 'span', 'span'], 'common/Table.svelte': ['div'],
  'common/Title.svelte': ['h2'],
  'common/Reading.svelte': ['div', 'div', 'span'], 'common/StatusLine.svelte': ['p', 'span'],
  'common/StaticSkeleton.svelte': ['span'],
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
  'lab/ObservationLab.svelte': ['div','main','section','section'], '../routes/+layout.svelte': [], '../routes/dashboard/fans/+page.svelte': [],
  '../routes/dashboard/thermals/+page.svelte': [], '../routes/dashboard/heads/+page.svelte': [], '../routes/dashboard/queue/+page.svelte': [],
  '../routes/dashboard/lab/composition/+page.svelte': ['details', 'details', 'h1', 'header', 'label', 'label', 'main', 'option', 'option', 'option', 'option', 'option', 'option', 'option', 'option', 'option', 'option', 'option', 'option', 'p', 'p', 'p', 'pre', 'pre', 'section', 'section', 'section', 'select', 'select', 'summary', 'summary'],
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
  'mcp/ObservationRoot.svelte': ['svelte', 'lucide-svelte', '../../lib/client/host/rpc', '../../lib/client/mcp/observation-host', '../../lib/client/mcp/heads', '../../lib/client/legacy/observation', '../live/LiveHeadsRoot.svelte', '../common/Mount.svelte', '../common/PageLayout.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/Icon.svelte', '../common/Skeleton.svelte', '../common/StateAnnouncement.svelte'],
  'observation/QueueWidget.svelte': ['./ObservationFrame.svelte', '../../lib/client/observation/types', '../../lib/client/observation/loading', '../common/Stack.svelte', '../common/Caption.svelte', './QueueSummary.svelte', './QueueRows.svelte', './QueueSkeleton.svelte', '../../lib/client/lab/queue-shapes'],
  'observation/QueueRow.svelte': ['../../lib/client/live/queue-presentation', '../common/Record.svelte', '../common/BoxLabel.svelte', '../common/Name.svelte', '../common/Caption.svelte', '../common/LoadingValue.svelte', '../common/DateTimeValue.svelte', '../common/DurationValue.svelte'],
  'observation/QueueRows.svelte': ['../../lib/client/live/queue-presentation', '../common/OrderedRecords.svelte', './QueueRow.svelte'],
  'observation/QueueSkeleton.svelte': ['../common/OrderedRecords.svelte', './QueueRow.svelte', '../common/LoadingValue.svelte', '../common/Caption.svelte', '../../lib/client/observation/loading'],
  'observation/QueueSummary.svelte': ['../../lib/client/live/queue-presentation', '../common/InfoPair.svelte', '../common/Caption.svelte', '../common/LoadingValue.svelte', '../../lib/client/observation/format'],
  'observation/DomainReceipt.svelte': ['../../lib/client/live/presentation', '../common/Caption.svelte', './ObservedMeta.svelte', '../../lib/client/observation/format'],
  'live/LiveQueueRoot.svelte': ['../common/LoadingValue.svelte', 'svelte', 'lucide-svelte', '../../lib/client/live/queue-controller', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../observation/DomainReceipt.svelte', '../observation/QueueSummary.svelte', '../observation/QueueRows.svelte', '../observation/QueueSkeleton.svelte'],
  'composable/PresentationNode.svelte': ['../../lib/composable/view-model', './component-registry', './PresentationNode.svelte'],
  'composable/PresentationRenderer.svelte': ['../../lib/composable/view-model', '../common/Stack.svelte', '../common/StatusLine.svelte', './PresentationNode.svelte'],
  'composable/ComposableMcpRoot.svelte': ['svelte', '../../lib/client/host/rpc', '../../lib/client/composable/host', '../../lib/client/composable/presentation', '../common/StatusLine.svelte', './PresentationRenderer.svelte'],
  'composable/HeadStatus.svelte': ['lucide-svelte', '../../lib/composable/view-model', '../common/Reading.svelte', '../common/Badge.svelte'],
  'composable/HeadTemperature.svelte': ['lucide-svelte', '../../lib/composable/view-model', '../common/Reading.svelte', '../common/Metric.svelte'],
  'composable/FilamentColor.svelte': ['lucide-svelte', '../../lib/composable/view-model', '../common/Reading.svelte', '../common/Swatch.svelte'],
  'composable/FanRelation.svelte': ['lucide-svelte', '../../lib/composable/view-model', '../common/Reading.svelte', '../common/Metric.svelte'],
  'observation/HeadsWidget.svelte': ['svelte', '../../lib/client/observation/types', '../../lib/client/observation/loading', '../../lib/client/live/copy-action', '../../lib/client/live/heads-presentation', '../../lib/client/common/clipboard', './HeadsPanel.svelte', '../../lib/client/observation/heads-loading'],
  'live/LiveHeadsRoot.svelte': ['svelte', '../../lib/client/live/heads-controller', '../../lib/client/live/heads-presentation', '../observation/HeadsPanel.svelte'],
  'observation/HeadsPanel.svelte': ['lucide-svelte', '../../lib/client/live/presentation', '../../lib/client/live/heads-presentation', '../../lib/client/observation/format', './HeadCards.svelte', './HeadsSkeleton.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', './ObservedMeta.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte', '../../lib/client/observation/heads-loading'],
  'observation/HeadCard.svelte': ['lucide-svelte', '../../lib/client/live/heads-presentation', '../common/InsetCard.svelte', '../common/ColorValue.svelte', '../common/Inline.svelte', '../common/Stack.svelte', '../common/Name.svelte', '../common/Caption.svelte', '../common/LoadingValue.svelte', '../common/TextSkeleton.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', './ActualTarget.svelte', '../../lib/client/observation/heads-loading'],
  'observation/HeadCards.svelte': ['../../lib/client/live/heads-presentation', '../common/CardGrid.svelte', './HeadCard.svelte', '../../lib/client/observation/heads-loading'],
  'observation/HeadsSkeleton.svelte': ['./HeadCards.svelte', '../../lib/client/observation/heads-loading'],
  'observation/ThermalReadings.svelte': ['../../lib/client/live/presentation', '../common/ReadingList.svelte', './ThermalReading.svelte'],
  'live/LiveThermalsRoot.svelte': ['svelte', 'lucide-svelte', '../../lib/client/live/thermals-controller', '../../lib/client/observation/format', '../observation/ThermalReadings.svelte', '../observation/ThermalsSkeleton.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', '../observation/ObservedMeta.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte'],
  'camera/LiveCameraRoot.svelte': ['./CameraWidget.svelte', '../../lib/client/camera/session', '../../lib/client/media/playback', '../../lib/client/camera/runtime'],
  'camera/CameraWidget.svelte': ['../common/Switch.svelte', '../../lib/client/camera/mode-options', 'lucide-svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/StateAnnouncement.svelte', '../common/MediaStatus.svelte', '../common/Video.svelte', '../../lib/client/media/playback', '../../lib/client/camera/session'],
  'camera/CameraLabRoot.svelte': ['svelte', './CameraLabWidget.svelte', '../lab/LabControls.svelte', '../common/PageLayout.svelte', '../../lib/client/camera/controller', '../../lib/client/camera/lab-location'],
  'camera/CameraLabWidget.svelte': ['../common/Switch.svelte', '../../lib/client/camera/mode-options', '../../lib/client/camera/session', '../common/Icon.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Caption.svelte', '../common/StateAnnouncement.svelte', './CameraStatus.svelte', './CameraMedia.svelte', '../../lib/client/camera/state'],
  'bed-mesh/BedMeshLabRoot.svelte': ['svelte', '../lab/LabControls.svelte', '../lab/ObservationLabPage.svelte', '../../lib/client/lab/bed-mesh-fixture', '../../lib/client/bed-mesh/lab-controller', '../../lib/client/bed-mesh/lab-location', './BedMeshWidget.svelte'],
  'observation/ObservationSkeleton.svelte': ['../../lib/client/observation/types', './OverviewWidget.svelte', './ProgressWidget.svelte', './HeadsWidget.svelte', './CurrentJobWidget.svelte', './JobHistoryWidget.svelte', './QueueWidget.svelte', '../../lib/client/observation/heads-loading', '../../lib/client/observation/loading'],
  'observation/FansWidget.svelte': ['./ObservationFrame.svelte', '../../lib/client/observation/types', '../../lib/client/observation/format', '../../lib/client/observation/state', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte', '../../lib/client/observation/loading', './FanReadings.svelte', './FansSkeleton.svelte'],
  'observation/FanReadings.svelte': ['../../lib/client/live/presentation', '../common/ReadingList.svelte', './FanReading.svelte'],
  'live/LiveObservationRoot.svelte': ['svelte', 'lucide-svelte', '../../lib/client/live/controller', '../../lib/client/observation/format', '../observation/FanReadings.svelte', '../observation/FansSkeleton.svelte', '../common/Shell.svelte', '../common/Header.svelte', '../common/Body.svelte', '../common/Footer.svelte', '../common/StateAnnouncement.svelte', '../common/StateSurface/StateSurface.svelte', '../observation/ObservedMeta.svelte', '../common/Caption.svelte', '../common/Icon.svelte', '../common/Button.svelte', '../common/Skeleton.svelte', '../common/FeedbackOverlay.svelte', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte'],
  'observation/FanReading.svelte': ['../../lib/client/observation/types', '../../lib/client/observation/fan-labels', '../common/PercentageBackground.svelte', '../common/ReadingRow.svelte', '../common/Inline.svelte', '../common/Icon.svelte', '../common/Name.svelte', '../common/MetricValue.svelte'],
  'observation/FansSkeleton.svelte': ['../../lib/client/observation/fan-labels', '../common/Stack.svelte', '../common/InfoPair.svelte', '../common/Label.svelte', '../common/Skeleton.svelte', '../common/ReadingList.svelte', '../common/ReadingRow.svelte', '../common/Inline.svelte', '../common/Icon.svelte', '../common/Name.svelte', '../common/MetricValue.svelte'],
  'observation/ThermalsWidget.svelte': ['./ObservationFrame.svelte', '../../lib/client/observation/types', '../../lib/client/observation/state', '../../lib/client/observation/loading', './ThermalReadings.svelte', './ThermalsSkeleton.svelte'],
  'observation/ActualTarget.svelte': ['../common/DegreeValue.svelte', '../common/Inline.svelte', '../common/Label.svelte'],
  'observation/ThermalReading.svelte': ['../../lib/client/live/presentation', './ActualTarget.svelte', '../common/Icon.svelte', '../common/Inline.svelte', '../common/Name.svelte', '../common/ReadingRow.svelte', '../common/PercentageBackground.svelte'],
  'observation/ThermalsSkeleton.svelte': ['../common/ReadingList.svelte', './ThermalReading.svelte'],
};
// Presentation is a typed rendering/service boundary; no host globals in composites.
for (const name of ['camera/CameraWidget.svelte', 'camera/LiveCameraRoot.svelte']) approvedImports[name].push('../../lib/client/media/presentation');
// Explicit shared footer/state contract.
approvedImports['camera/CameraWidget.svelte'].push('../common/Footer.svelte', '../common/StateSurface/StaticStateSurface.svelte', '../common/Skeleton.svelte', '../../lib/client/camera/failure');
approvedImports['camera/CameraLabWidget.svelte'].push('lucide-svelte', '../common/Button.svelte', '../common/Footer.svelte', '../common/StateSurface/StaticStateSurface.svelte', '../common/Skeleton.svelte');

for (const name of ['observation/FanReading.svelte', 'observation/FansSkeleton.svelte', 'observation/ThermalReading.svelte']) approvedImports[name].push('../../lib/client/observation/icons');
for (const name of ['live/LiveObservationRoot.svelte', 'live/LiveThermalsRoot.svelte', 'live/LiveQueueRoot.svelte']) approvedImports[name].push('../../lib/client/observation/icons');

// Fixed renderer cutover: move existing DOM debt, never expand the native-tag frontier.
debt['observation/ProgressPanel.svelte'] = debt['observation/ProgressWidget.svelte'];
delete debt['observation/ProgressWidget.svelte'];
composites.push('observation/ProgressWidget.svelte');
debt['observation/JobsPanel.svelte'] = debt['observation/CurrentJobWidget.svelte'];
delete debt['observation/CurrentJobWidget.svelte'];
composites.push('observation/CurrentJobWidget.svelte');
debt['observation/HistoryPanel.svelte'] = debt['observation/JobHistoryWidget.svelte'];
delete debt['observation/JobHistoryWidget.svelte'];
composites.push('observation/JobHistoryWidget.svelte');
debt['observation/OverviewPanel.svelte'] = debt['observation/OverviewWidget.svelte'];
delete debt['observation/OverviewWidget.svelte'];
composites.push('observation/OverviewWidget.svelte');
debt['bed-mesh/BedMeshPanel.svelte'] = debt['bed-mesh/BedMeshWidget.svelte'];
delete debt['bed-mesh/BedMeshWidget.svelte'];
composites.push('bed-mesh/BedMeshWidget.svelte');
approvedImports["mcp/ObservationRoot.svelte"] = ["svelte", "../../lib/client/host/rpc", "../../lib/client/mcp/observation-host", "../../lib/client/mcp/heads", "../../lib/client/live/controller", "../../lib/client/live/thermals-controller", "../../lib/client/live/queue-controller", "../../lib/client/live/observation-port", "../../lib/client/live/focused-controllers", "../../lib/client/live/bed-mesh-controller", "../live/LiveHeadsRoot.svelte", "../live/LiveObservationRoot.svelte", "../live/LiveThermalsRoot.svelte", "../live/LiveQueueRoot.svelte", "../live/LiveProgressRoot.svelte", "../live/LiveJobsRoot.svelte", "../live/LiveHistoryRoot.svelte", "../live/LiveOverviewRoot.svelte", "../live/LiveBedMeshRoot.svelte", "../common/PageLayout.svelte", "../common/Shell.svelte", "../common/Header.svelte", "../common/Body.svelte", "../common/Footer.svelte", "../common/Icon.svelte", "../common/Skeleton.svelte", "../common/StateAnnouncement.svelte", "lucide-svelte"];
approvedImports["observation/ProgressWidget.svelte"] = ["../../lib/client/observation/types", "../../lib/client/observation/loading", "./ProgressPanel.svelte", "../common/Caption.svelte", "./ObservedMeta.svelte"];
approvedImports["observation/CurrentJobWidget.svelte"] = ["../../lib/client/observation/types", "../../lib/client/observation/loading", "./JobsPanel.svelte", "../common/Caption.svelte", "./ObservedMeta.svelte"];
approvedImports["observation/JobHistoryWidget.svelte"] = ["../../lib/client/observation/types", "../../lib/client/observation/loading", "./HistoryPanel.svelte", "../common/Caption.svelte", "./ObservedMeta.svelte"];
approvedImports["observation/OverviewWidget.svelte"] = ["../../lib/client/observation/types", "../../lib/client/observation/loading", "./OverviewPanel.svelte", "../common/Caption.svelte", "./ObservedMeta.svelte"];
approvedImports["bed-mesh/BedMeshWidget.svelte"] = ["svelte", "./BedMeshPanel.svelte"];
composites.push('live/LiveProgressRoot.svelte');
approvedImports["live/LiveProgressRoot.svelte"] = ["svelte", "../../lib/client/live/focused-controllers", "../observation/ProgressPanel.svelte"];
approvedImports['live/LiveProgressRoot.svelte'].push('../../lib/client/live/progress-controller');
composites.push('observation/ToolpathPreview.svelte');
approvedImports['observation/ToolpathPreview.svelte'] = ['lucide-svelte', '../../lib/toolpath', '../common/Stack.svelte', '../common/Caption.svelte', '../common/Name.svelte', '../common/Inline.svelte', '../common/Button.svelte', '../common/ChartFrame.svelte', './ToolpathCanvas.svelte'];
leaves['observation/ToolpathCanvas.svelte'] = ['canvas'];
composites.push('live/LiveJobsRoot.svelte');
approvedImports["live/LiveJobsRoot.svelte"] = ["svelte", "../../lib/client/live/focused-controllers", "../observation/JobsPanel.svelte", "../observation/DomainReceipt.svelte"];
composites.push('live/LiveHistoryRoot.svelte');
approvedImports["live/LiveHistoryRoot.svelte"] = ["svelte", "../../lib/client/live/focused-controllers", "../observation/HistoryPanel.svelte", "../observation/DomainReceipt.svelte"];
composites.push('live/LiveOverviewRoot.svelte');
approvedImports["live/LiveOverviewRoot.svelte"] = ["svelte", "../../lib/client/live/focused-controllers", "../observation/OverviewPanel.svelte"];
composites.push('live/LiveBedMeshRoot.svelte');
approvedImports["live/LiveBedMeshRoot.svelte"] = ["svelte", "lucide-svelte", "../../lib/client/live/bed-mesh-controller", "../bed-mesh/BedMeshPanel.svelte", "../observation/DomainReceipt.svelte", "../common/Button.svelte", "../common/Skeleton.svelte"];
debt['../routes/dashboard/progress/+page.svelte'] = [];
debt['../routes/dashboard/jobs/+page.svelte'] = [];
debt['../routes/dashboard/job_history/+page.svelte'] = [];
debt['../routes/dashboard/overview/+page.svelte'] = [];
debt['../routes/dashboard/bed_mesh/+page.svelte'] = [];

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
  if (imports.includes('./component-registry')) components.add('Component');
  if (strict && ast.css) violations.push('style block');
  visit(ast, (node) => {
    if (node.type === 'RegularElement') { tags.push(node.name!); if (strict) violations.push(`native ${node.name}`); }
    if (!strict) return;
    const expression = node.expression as { type?: string; object?: { type?: string; name?: string }; property?: { type?: string; name?: string }; computed?: boolean } | undefined;
    const closedRegistrySpread = node.type === 'SpreadAttribute'
      && imports.includes('./component-registry')
      && expression?.type === 'MemberExpression'
      && expression.object?.type === 'Identifier'
      && expression.object.name === 'registered'
      && expression.property?.type === 'Identifier'
      && expression.property.name === 'props'
      && expression.computed === false;
    if (node.type === 'HtmlTag' || node.type === 'RenderTag' || (node.type === 'SpreadAttribute' && !closedRegistrySpread) || node.type?.startsWith('Svelte')) violations.push(`escape ${node.type}`);
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
