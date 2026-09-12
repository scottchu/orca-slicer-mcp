export const assertWidgetClientModule = (id: string): void => {
  if (/\/src\/(?:lib\/server|routes)\/|\/src\/entrypoints\/(?!widgets\/)|\/\.svelte-kit\//.test(id)) {
    throw new Error(`Widget imported a server or application route module: ${id}`);
  }
};
export const assertObservationLabModule = (id: string): void => {
  assertWidgetClientModule(id);
  if (/\/lib\/client\/live\/(?:(?:[\w-]+-)?(?:adapter|controller)|observation-port|host-rpc)\./.test(id) || /\/(?:components|lib\/client)\/(?:camera|host)\//.test(id)) throw new Error(`Observation lab imported a live or Camera module: ${id}`);
};
export const assertLiveObservationModule = (id: string, view?: Exclude<FocusedProductionView, 'camera'>): void => {
  assertWidgetClientModule(id);
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:tests|(?:components|lib\/client)\/lab|lib\/client\/fixtures)\/|\/(?:components|lib\/client)\/observation\/(?:fixtures|controller)\.|\/(?:components|lib\/client)\/camera\//.test(id) || (view !== 'bed_mesh' && /\/(?:components|lib\/client)\/bed-mesh\/|\/three\//.test(id))) throw new Error(`Live observation imported nonproduction source: ${id}`);
  if (/\/(?:components\/bed-mesh\/BedMesh(?:LabRoot|Widget)|lib\/client\/bed-mesh\/lab-[\w-]+)\./.test(id)) throw new Error(`Live observation imported synthetic mesh source: ${id}`);
  if (view) {
    for (const other of ['fans', 'thermals', 'heads', 'queue'] as const) {
      if (other !== view && new RegExp(`/lib/client/live/${other}-(?:adapter|controller|presentation)\\.`).test(id)) {
        throw new Error(`Live ${view} imported another observation domain: ${id}`);
      }
    }
  }
};
export const assertLiveObservationBytes = (bytes: number): void => {
  if (!Number.isSafeInteger(bytes) || bytes < 1) throw new Error('Invalid live observation byte count');
};
export const FOCUSED_PRODUCTION_VIEWS = [
  'fans', 'thermals', 'camera', 'heads', 'queue', 'jobs', 'job_history', 'progress', 'overview', 'bed_mesh',
] as const;
export type FocusedProductionView = typeof FOCUSED_PRODUCTION_VIEWS[number];
export const assertFocusedProductionInventory = (
  entries: readonly { view: FocusedProductionView; bytes: number }[],
): void => {
  const views = entries.map(({ view }) => view);
  if (entries.length < 1 || entries.length > FOCUSED_PRODUCTION_VIEWS.length ||
      new Set(views).size !== views.length ||
      !views.every((view) => FOCUSED_PRODUCTION_VIEWS.includes(view)) ||
      !entries.every(({ bytes }) => Number.isSafeInteger(bytes) && bytes > 0)) {
    throw new Error('Invalid focused production widget inventory');
  }
};
