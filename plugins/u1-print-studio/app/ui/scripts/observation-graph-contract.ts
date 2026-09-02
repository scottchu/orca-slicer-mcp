export const assertObservationLabModule = (id: string): void => {
  if (/\/lib\/live\/(?:(?:[\w-]+-)?(?:adapter|controller)|observation-port|host-rpc)\./.test(id) || /\/lib\/(?:camera|host)\//.test(id)) throw new Error(`Observation lab imported a live or Camera module: ${id}`);
};
export const assertLiveObservationModule = (id: string, view?: 'fans' | 'thermals' | 'heads' | 'queue'): void => {
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:tests|lib\/lab|lib\/fixtures)\/|\/lib\/observation\/(?:fixtures|controller)\.|\/lib\/(?:camera|bed-mesh)\/|\/three\//.test(id)) throw new Error(`Live observation imported nonproduction source: ${id}`);
  if (view) {
    for (const other of ['fans', 'thermals', 'heads', 'queue'] as const) {
      if (other !== view && new RegExp(`/lib/live/${other}-(?:adapter|controller|presentation)\\.`).test(id)) {
        throw new Error(`Live ${view} imported another observation domain: ${id}`);
      }
    }
  }
};
export const assertLiveObservationBytes = (bytes: number): void => {
  if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > 100_000) throw new Error('Invalid live observation byte count or 100 KB budget exceeded');
};
export const assertCurrentJobModule = (id: string): void => {
  assertLiveObservationModule(id);
  if (/\/lib\/live\//.test(id) && !/\/(?:LiveCurrentJobRoot\.svelte|current-job-(?:adapter|controller)\.ts|controller\.ts|validation\.ts|presentation\.ts|observation-port\.ts)$/.test(id)) throw new Error(`Current Job imported another live domain: ${id}`);
  if (/\/lib\/observation\//.test(id) && !/\/(?:CurrentJob(?:Facts|Panel)\.svelte|DomainReceipt\.svelte|format\.ts|current-job-value\.ts)$/.test(id)) throw new Error(`Current Job imported a fixture or another observation domain: ${id}`);
  if (/\/LabControls\.svelte$/.test(id)) throw new Error('Current Job imported lab controls');
};
export const FOCUSED_PRODUCTION_AGGREGATE_LIMIT = 1_550_000;
export const FOCUSED_PRODUCTION_VIEWS = [
  'fans', 'thermals', 'camera', 'heads', 'queue', 'jobs', 'job_history', 'progress', 'overview', 'bed_mesh',
] as const;
export type FocusedProductionView = typeof FOCUSED_PRODUCTION_VIEWS[number];
export const assertFocusedProductionAggregate = (
  entries: readonly { view: FocusedProductionView; bytes: number }[],
): void => {
  const views = entries.map(({ view }) => view);
  if (entries.length < 1 || entries.length > FOCUSED_PRODUCTION_VIEWS.length ||
      new Set(views).size !== views.length ||
      !views.every((view) => FOCUSED_PRODUCTION_VIEWS.includes(view)) ||
      !entries.every(({ bytes }) => Number.isSafeInteger(bytes) && bytes > 0)) {
    throw new Error('Invalid focused production widget inventory');
  }
  if (entries.reduce((total, { bytes }) => total + bytes, 0) > FOCUSED_PRODUCTION_AGGREGATE_LIMIT) {
    throw new Error('Focused production widget aggregate exceeded 1.55 MB');
  }
};
