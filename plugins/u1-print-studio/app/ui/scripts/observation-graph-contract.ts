export const assertObservationLabModule = (id: string): void => {
  if (/\/lib\/live\/(?:(?:[\w-]+-)?(?:adapter|controller)|observation-port|host-rpc)\./.test(id) || /\/lib\/(?:camera|host)\//.test(id)) throw new Error(`Observation lab imported a live or Camera module: ${id}`);
};
export const assertLiveObservationModule = (id: string): void => {
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:tests|lib\/lab|lib\/fixtures)\/|\/lib\/observation\/(?:fixtures|controller)\.|\/lib\/(?:camera|bed-mesh)\/|\/three\//.test(id)) throw new Error(`Live observation imported nonproduction source: ${id}`);
};
export const assertLiveObservationBytes = (bytes: number): void => {
  if (!Number.isSafeInteger(bytes) || bytes < 1 || bytes > 100_000) throw new Error('Invalid live observation byte count or 100 KB budget exceeded');
};
