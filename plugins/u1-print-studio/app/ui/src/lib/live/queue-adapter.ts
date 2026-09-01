import type { QueuePresentation, QueueRecord } from './queue-presentation';
import { record, exact, choice, number, time, flag, capability, evidence, reason, provenance, observationEnvelope, string } from './validation';

// Mirror the normalized public-basename boundary without importing an adapter
// that owns child_process/network capabilities into the presentation graph.
const filename = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim() || Array.from(value).length > 160 || value === '.' || value === '..' ||
      !/^[\p{L}\p{M}\p{N} ._()+-]+$/u.test(value) ||
      /(?:^|[^a-z0-9])(?:gh[pousr]_[a-z0-9]{16,255}|github_pat_[a-z0-9_]{16,255}|glpat-[a-z0-9_-]{16,255}|xox[baprs]-[a-z0-9-]{16,255}|(?:AKIA|ASIA)[a-z0-9]{16})/i.test(value) ||
      /\b(?:bearer|basic)\s+|\b(?:api[-_ ]?key|(?:access|refresh)[-_ ]?token|password|secret|credential)[ _.-]+\S|\bsk-(?:proj-)?[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/i.test(value)) throw new Error('Invalid queue filename');
  return value;
};
const addedTime = (value: unknown): string | null => {
  const parsed = time(value);
  if (parsed !== null && Date.parse(parsed) < 0) throw new Error('Invalid added time');
  return parsed;
};
export const adaptQueue = (value: unknown): QueuePresentation => {
  const { envelope, ...base } = observationEnvelope(value, 'queue');
  const module = record(envelope.module);
  exact(module, ['kind', 'state', 'freshness', 'sourceObservedAt', 'receivedAt', 'checkedAt', 'queueState', 'items', 'totalCount', 'truncated', 'reason', 'capabilityEvidence', 'provenance']);
  if (module.kind !== 'queue') throw new Error('Wrong module');
  const state = evidence(module.state), moduleCapability = capability(module.capabilityEvidence), moduleProvenance = provenance(module.provenance);
  const receipt: QueuePresentation['receipt'] = { sourceObservedAt: time(module.sourceObservedAt), receivedAt: time(module.receivedAt), checkedAt: time(module.checkedAt), freshness: choice(module.freshness, ['fresh', 'stale', 'unknown']), reason: reason(module.reason) };
  const queueState = module.queueState === null ? null : choice(module.queueState, ['ready', 'loading', 'starting', 'paused'] as const);
  const totalCount = module.totalCount === null ? null : number(module.totalCount, 1000);
  if (totalCount !== null && !Number.isInteger(totalCount)) throw new Error('Invalid queue count');
  const truncated = flag(module.truncated);
  if (!Array.isArray(module.items) || module.items.length > 100) throw new Error('Invalid queue records');
  const items = module.items.map((value, index): QueueRecord => {
    const row = record(value); exact(row, ['position', 'filename', 'timeAdded', 'timeInQueueSeconds']);
    if (row.position !== index + 1) throw new Error('Invalid queue position');
    return { position: index + 1, filename: filename(row.filename), timeAdded: addedTime(row.timeAdded), timeInQueueSeconds: row.timeInQueueSeconds === null ? null : number(row.timeInQueueSeconds, Number.MAX_VALUE) };
  });
  const observed = state === 'known' || state === 'stale';
  if (observed) {
    if (totalCount === null || queueState === null || items.length !== Math.min(totalCount, 100) || truncated !== (totalCount > 100) ||
        receipt.sourceObservedAt === null || receipt.receivedAt === null || receipt.checkedAt === null ||
        receipt.freshness !== (state === 'known' ? 'fresh' : 'stale') || moduleCapability !== 'observed' || moduleProvenance.source !== 'moonraker') throw new Error('Invalid observed queue');
  } else if (totalCount !== null || queueState !== null || items.length || truncated || receipt.sourceObservedAt !== null || receipt.receivedAt !== null || receipt.freshness !== 'unknown' ||
      moduleCapability !== (state === 'unsupported' ? 'unsupported' : 'unknown') || moduleProvenance.source !== 'not_observed') throw new Error('Invalid unobserved queue');
  if (moduleProvenance.sourceObservedAt !== receipt.sourceObservedAt) throw new Error('Invalid queue provenance');
  const session = record(envelope.session);
  return { ...base, kind: 'queue', printerState: string(envelope.printerState), printerStateLabel: string(envelope.printerStateLabel), refreshAfterSeconds: number(envelope.refreshAfterSeconds, 3600),
    session: { identity: null, provenance: choice(session.provenance, ['external', 'unknown']), detail: string(session.detail) },
    state, capability: moduleCapability, provenance: moduleProvenance, receipt, queueState, totalCount, truncated, items };
};
