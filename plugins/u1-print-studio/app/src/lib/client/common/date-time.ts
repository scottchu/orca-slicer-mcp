const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' } as const;
export const formatDateTime = (value: string): string => new Date(value).toLocaleString([], options);
// A public format example is structural UI metadata, never a receipt or clock.
export const neutralDateTimeShape = (): string => formatDateTime('2000-01-01T13:00:00.000Z').replace(/\p{N}/gu, '0');
