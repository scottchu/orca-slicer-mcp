import { choice, exact, record, time } from './validation';
import { basename, domainKeys, domainReceipt, focusedBase, integer, nonnegative, nullable } from './focused-validation';
import { historyStatuses, type HistoryPresentation, type HistoryRecord } from './focused-presentation';
export const adaptHistory = (value: unknown): HistoryPresentation => {
  const { module, base } = focusedBase(value, 'job_history');
  exact(module, [...domainKeys, 'items', 'pageCount']);
  const receipt = domainReceipt(module, base);
  if (!Array.isArray(module.items) || module.items.length > 20) throw new Error('Invalid history page');
  const pageCount = nullable(module.pageCount, value => integer(value, 20));
  const items = module.items.map((value, index): HistoryRecord => {
    const row = record(value); exact(row, ['position', 'filename', 'status', 'startTime', 'endTime', 'printDurationSeconds', 'totalDurationSeconds', 'filamentUsedMillimeters']);
    if (row.position !== index + 1) throw new Error('Invalid history order');
    return { position: index + 1, filename: basename(row.filename), status: choice(row.status, historyStatuses), startTime: time(row.startTime), endTime: time(row.endTime), printDurationSeconds: nullable(row.printDurationSeconds, nonnegative), totalDurationSeconds: nullable(row.totalDurationSeconds, nonnegative), filamentUsedMillimeters: nullable(row.filamentUsedMillimeters, nonnegative) };
  });
  if (base.state === 'known' || base.state === 'stale') { if (pageCount !== items.length) throw new Error('Invalid history count'); }
  else if (pageCount !== null || items.length) throw new Error('Unobserved history records');
  return { ...base, kind: 'job_history', receipt, items, pageCount };
};
