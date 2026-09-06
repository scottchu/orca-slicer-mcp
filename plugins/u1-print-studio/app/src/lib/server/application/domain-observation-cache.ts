type DomainReceipt = {
  state: string;
  freshness: string;
  sourceObservedAt: string | null;
  checkedAt: string | null;
  reason: string | null;
};

/** Mechanism only; domain readers, receipts and TTLs remain independently owned. */
export const createDomainObservationCache = <T extends DomainReceipt>(options: {
  initial: T;
  read?: () => Promise<T>;
  ttlMs: number;
  unavailable: (checkedAt: string) => T;
  now: () => Date;
  received: () => void;
}) => {
  let retained = options.initial;
  let flight: Promise<void> | null = null;
  const current = async (refresh: boolean): Promise<void> => {
    const checked = Date.parse(retained.checkedAt ?? '');
    const due = !Number.isFinite(checked) || options.now().valueOf() - checked >= options.ttlMs;
    if (retained.checkedAt !== null && (!refresh || !due)) return;
    if (!options.read) return;
    if (!flight) {
      flight = (async () => {
        let result: T;
        try { result = await options.read!(); }
        catch { result = options.unavailable(options.now().toISOString()); }
        if (result.state === 'known') retained = result;
        else if (retained.sourceObservedAt !== null) retained = {
          ...retained, state: 'stale', freshness: 'stale',
          checkedAt: result.checkedAt ?? options.now().toISOString(), reason: result.reason,
        };
        else retained = { ...result, checkedAt: result.checkedAt ?? options.now().toISOString() };
        options.received();
      })().finally(() => { flight = null; });
    }
    await flight;
  };
  const value = (): T => {
    if (retained.state !== 'known') return retained;
    const observed = Date.parse(retained.sourceObservedAt ?? '');
    return !Number.isFinite(observed) || options.now().valueOf() - observed >= options.ttlMs
      ? { ...retained, state: 'stale', freshness: 'stale' } : retained;
  };
  return { current, value };
};

export type DomainObservationCache<T extends DomainReceipt> = ReturnType<typeof createDomainObservationCache<T>>;
