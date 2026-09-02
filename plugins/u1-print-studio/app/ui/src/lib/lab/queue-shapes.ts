import { queueLabFixture } from '../fixtures/observations';
import { formatDateTime } from '../common/date-time';
import { structureCount } from '../observation/loading';

// Closed synthetic layout metadata only. This module is excluded from every
// production graph and never receives a real observation/filename/receipt.
export const queueLoadingShapes = (rows: number) => Array.from({ length: structureCount(rows, 100) }, (_, index) => ({
  name: `Queued item ${'0'.repeat(String(index + 1).length)}`,
  date: formatDateTime(queueLabFixture.items[index % queueLabFixture.items.length].addedAt).replace(/\p{N}/gu, '0'),
}));
