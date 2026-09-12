import { choice, evidence, exact, flag, number, record, string, time } from './validation';
import { basename, focusedBase, integer, nullable, printStates } from './focused-validation';
import { historyStatuses, type FocusedBase, type OverviewPresentation, type OverviewReceipt, type OverviewTile } from './focused-presentation';
import { formatDuration, titleCase } from '../observation/format';

const ids = ['progress', 'thermals', 'heads', 'jobs', 'job_history', 'queue', 'fans', 'bed_mesh'] as const;
const failedReasons = ['unsupported', 'unauthorized', 'http_error', 'timeout', 'network', 'malformed', 'too_large', 'not_configured'];
const observed = (state: string) => state === 'known' || state === 'stale';
const allNull = (values: unknown[]) => values.every(value => value === null);
const maybeNumber = (value: unknown, max = Number.MAX_SAFE_INTEGER, min = 0) => nullable(value, value => number(value, max, min));
const maybeInteger = (value: unknown, max: number, min = 0) => nullable(value, value => { const parsed = integer(value, max); if (parsed < min) throw new Error('Invalid headline integer'); return parsed; });
const thermal = (value: unknown) => maybeNumber(value, Number.MAX_VALUE, -Number.MAX_VALUE);
const degrees = (value: number | null) => value === null ? 'Unknown' : `${Math.round(value)}°`;
const receipt = (value: unknown, status: boolean, base: FocusedBase): OverviewReceipt => {
  const data = record(value);
  exact(data, ['state', 'sourceObservedAt', 'freshness', ...(Object.hasOwn(data, 'reason') ? ['reason'] : [])]);
  const result: OverviewReceipt = { state: evidence(data.state), sourceObservedAt: time(data.sourceObservedAt), freshness: choice(data.freshness, ['fresh', 'stale', 'offline', 'unknown']), reason: data.reason == null ? null : choice(data.reason, ['not_requested', 'not_reported', ...failedReasons]) };
  if (status && (result.sourceObservedAt !== base.sourceObservedAt || result.freshness !== base.freshness)) throw new Error('Mismatched status receipt');
  if (result.state === 'known') { if (!result.sourceObservedAt || result.freshness !== 'fresh' || result.reason !== null) throw new Error('Invalid known receipt'); }
  else if (result.state === 'stale') { if (!result.sourceObservedAt || result.freshness !== 'stale') throw new Error('Invalid stale receipt'); }
  else if (status && result.state === 'unavailable') {
    if (result.reason !== null || (result.freshness === 'stale' ? result.sourceObservedAt === null : !['offline', 'unknown'].includes(result.freshness) || result.sourceObservedAt !== null)) throw new Error('Invalid unavailable status');
  } else {
    if (result.sourceObservedAt !== null || result.freshness !== 'unknown') throw new Error('Invalid absent receipt');
    if (result.state === 'unknown' ? ![null, 'not_requested', 'not_reported'].includes(result.reason) : result.state === 'unsupported' ? !['unsupported', 'not_reported'].includes(result.reason ?? '') : result.reason === null || !failedReasons.includes(result.reason) || result.reason === 'unsupported') throw new Error('Invalid failure reason');
  }
  return result;
};

const adaptTile = (value: unknown, id: typeof ids[number], base: FocusedBase): OverviewTile => {
  const tile = record(value), state = evidence(tile.state), inputs = record(tile.receipts);
  const receiptKeys = { progress: ['status'], thermals: ['status', 'environment'], heads: ['status', 'materials'], jobs: ['currentJob'], job_history: ['jobHistory'], queue: ['queue'], fans: ['environment'], bed_mesh: ['bedMesh'] }[id];
  exact(inputs, receiptKeys);
  const receipts = receiptKeys.map(key => ({ label: ({ status: 'Printer', environment: id === 'thermals' ? 'Cavity' : 'Environment', materials: 'Material', currentJob: 'Current Job', jobHistory: 'History', queue: 'Queue', bedMesh: 'Bed Mesh' } as Record<string, string>)[key], value: receipt(inputs[key], key === 'status', base) }));
  const first = receipts[0].value;
  if (receipts.some(({ value }) => value.state === 'stale' && value.reason !== null && (value.reason === 'not_reported' || failedReasons.includes(value.reason)))) throw new Error('Failed retained receipt');
  const keys = (fields: string[]) => exact(tile, ['id', 'state', 'receipts', ...fields]);
  const optional = (values: unknown[]) => { if (state !== first.state || (!observed(first.state) && !allNull(values))) throw new Error('Unobserved headline values'); };
  let primary = '', secondary = '';
  if (id === 'progress') {
    keys(['printState', 'percent', 'currentLayer', 'totalLayers', 'estimatedRemainingSeconds']);
    const printState = choice(tile.printState, printStates), percent = maybeNumber(tile.percent, 100), current = maybeInteger(tile.currentLayer, Number.MAX_SAFE_INTEGER), total = maybeInteger(tile.totalLayers, Number.MAX_SAFE_INTEGER), eta = maybeNumber(tile.estimatedRemainingSeconds, Number.MAX_VALUE);
    if ((observed(state) ? state !== first.state : state !== 'unknown') || state === 'unknown' && (!allNull([percent, current, total, eta]) || first.state === 'unavailable' && printState !== 'unknown')) throw new Error('Invalid progress headline');
    primary = percent === null ? 'Progress unknown' : `${percent.toFixed(percent % 1 ? 1 : 0)}%`;
    secondary = `${titleCase(printState)} · ${current === null || total === null ? 'Layers unknown' : `Layer ${current} / ${total}`} · ${eta === null ? 'Estimate unknown' : `About ${formatDuration(eta)} left`}`;
  } else if (id === 'thermals') {
    keys(['activeTool', 'activeActualC', 'activeTargetC', 'bedActualC', 'bedTargetC', 'cavityActualC']);
    const tool = maybeInteger(tile.activeTool, 4, 1), actual = thermal(tile.activeActualC), target = thermal(tile.activeTargetC), bed = thermal(tile.bedActualC), bedTarget = thermal(tile.bedTargetC), cavity = maybeNumber(tile.cavityActualC, 999, -273.15);
    const statusValues = [tool, actual, target, bed, bedTarget];
    if (tool === null && !allNull([actual, target]) || state !== (!allNull([actual, target, bed, bedTarget]) ? first.state : cavity !== null ? receipts[1].value.state : 'unknown') || !allNull(statusValues) && !observed(first.state) || cavity !== null && !observed(receipts[1].value.state)) throw new Error('Invalid thermal headline');
    primary = tool === null ? 'Active tool unknown' : `T${tool} ${degrees(actual)} / ${degrees(target)}`;
    secondary = `Bed ${degrees(bed)} / ${degrees(bedTarget)} · Cavity ${degrees(cavity)}`;
  } else if (id === 'heads') {
    keys(['activeTool', 'material', 'color', 'reportedPresence']);
    const tool = maybeInteger(tile.activeTool, 4, 1), material = nullable(tile.material, value => { const text = string(value, 194); if (!/^[\p{L}\p{N} _+()-]+$/u.test(text) || text !== text.trim() || /^(NONE|UNKNOWN|NULL|N\/A)$/i.test(text) || /^sk[-_]/i.test(text) || /(?:api[-_ ]?key|password|secret|token|credential)/i.test(text) || /^(?:(?:Bearer|Basic)\s|gh[pousr]_|github_pat_|glpat-|xox[baprs]-|(?:AKIA|ASIA)[A-Z0-9]{16})/i.test(text)) throw new Error('Invalid material'); return text; }), color = nullable(tile.color, value => { const text = string(value, 9); if (!/^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text)) throw new Error('Invalid material color'); return text; }), presence = nullable(tile.reportedPresence, flag);
    const values = [tool, material, color, presence];
    if (tool === null && !allNull([material, color, presence]) || state !== (allNull(values) ? 'unknown' : first.state) || !allNull(values) && !observed(first.state) || !allNull([material, color, presence]) && !observed(receipts[1].value.state)) throw new Error('Invalid head headline');
    primary = tool === null ? 'Active head unknown' : `T${tool} · ${presence === false ? 'Empty' : presence === true ? material ?? 'Material unknown' : 'Presence unknown'}`;
    secondary = presence === true && color !== null ? `Configured color ${color}` : 'Printer-reported material';
  } else if (id === 'jobs') {
    keys(['printState', 'storageActive']);
    const printState = nullable(tile.printState, value => choice(value, printStates)), active = nullable(tile.storageActive, flag);
    optional([printState, active]); primary = printState === null ? 'State not reported' : titleCase(printState); secondary = active === null ? 'Storage not reported' : active ? 'Storage active' : 'Storage inactive';
  } else if (id === 'job_history') {
    keys(['pageCount', 'statusCounts']);
    const count = maybeInteger(tile.pageCount, 20);
    if (count === null) { if (tile.statusCounts !== null) throw new Error('Unexpected history counts'); }
    else { const counts = record(tile.statusCounts); exact(counts, [...historyStatuses]); if (historyStatuses.reduce((sum, status) => sum + integer(counts[status], 20), 0) !== count) throw new Error('Invalid history aggregate'); }
    optional([count, tile.statusCounts]);
    if (observed(first.state) && count === null) throw new Error('Missing observed history count');
    primary = count === null ? 'Page not observed' : `${count} recent records`;
    secondary = count === null ? 'Status aggregate unavailable' : Object.entries(record(tile.statusCounts)).filter(([, value]) => value !== 0).map(([status, count]) => `${count} ${titleCase(status)}`).join(' · ') || 'No records returned';
  } else if (id === 'queue') {
    keys(['queueState', 'totalCount']);
    const queueState = nullable(tile.queueState, value => choice(value, ['ready', 'loading', 'starting', 'paused'])), count = maybeInteger(tile.totalCount, 1000);
    optional([queueState, count]); if (observed(first.state) && (queueState === null || count === null)) throw new Error('Missing queue headline');
    primary = count === null ? 'Count unknown' : `${count} queued`; secondary = queueState === null ? 'State unknown' : titleCase(queueState);
  } else if (id === 'fans') {
    keys(['reportedFanCount', 'purifierPowerDetected', 'purifierMode']);
    const count = maybeInteger(tile.reportedFanCount, 7), power = nullable(tile.purifierPowerDetected, flag), mode = nullable(tile.purifierMode, value => choice(value, ['idle', 'cool_chamber', 'preheat_chamber', 'hot_chamber']));
    optional([count, power, mode]); if (power !== true && mode !== null) throw new Error('Invalid purifier headline');
    primary = count === null ? 'Fans not observed' : `${count} of 7 fans reported`; secondary = power === null ? 'Purifier not reported' : power ? `Purifier detected · ${mode === null ? 'Mode unknown' : titleCase(mode)}` : 'Purifier not detected';
  } else {
    keys(['active', 'rows', 'columns', 'rangeMillimeters']);
    const active = nullable(tile.active, flag), rows = maybeInteger(tile.rows, 64, 2), columns = maybeInteger(tile.columns, 64, 2), range = maybeNumber(tile.rangeMillimeters, 2_000_000);
    optional([active, rows, columns, range]);
    if (active === true ? [rows, columns, range].some(value => value === null) : !allNull([rows, columns, range]) || observed(first.state) && active === null) throw new Error('Invalid mesh headline');
    primary = active === null ? 'Mesh state unknown' : active ? `${range!.toFixed(3)} mm range` : 'No active mesh'; secondary = active ? `Active mesh · ${columns} × ${rows} reported grid` : '';
  }
  return { id, state, valid: true, primary, secondary, receipts };
};

export const adaptOverview = (value: unknown): OverviewPresentation => {
  const { module, base } = focusedBase(value, 'overview');
  exact(module, ['kind', 'state', 'capabilityEvidence', 'provenance', 'coverage', 'tiles']);
  const coverage = choice(module.coverage, ['complete', 'partial', 'none']);
  if (!Array.isArray(module.tiles) || module.tiles.length !== ids.length) throw new Error('Invalid Overview topology');
  const inputTiles = module.tiles.map((value, index) => { const tile = record(value); if (tile.id !== ids[index]) throw new Error('Invalid Overview order'); evidence(tile.state); return tile; });
  const available = inputTiles.filter(tile => observed(String(tile.state))).length;
  if (coverage !== (available === 0 ? 'none' : available === ids.length ? 'complete' : 'partial')) throw new Error('Invalid Overview coverage');
  const tiles = inputTiles.map((tile, index): OverviewTile => {
    try { return adaptTile(tile, ids[index], base); }
    catch { return { id: ids[index], state: 'unavailable', valid: false, primary: 'Data could not be read', secondary: 'Other domains remain available', receipts: [] }; }
  });
  const accepted = tiles.filter(tile => tile.valid && observed(tile.state)).length;
  return { ...base, kind: 'overview', coverage: accepted === 0 ? 'none' : accepted === ids.length ? 'complete' : 'partial', tiles };
};
