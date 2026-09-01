export type QuantityUnit = 'bytes' | 'mm' | 'seconds';

export const formatQuantity = (value: number | null, unit: QuantityUnit) => {
  if (value === null) return { text: '—', label: `${unit} not reported` };
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER || (unit === 'bytes' && !Number.isSafeInteger(value))) throw new Error('Invalid quantity');
  const symbol = unit === 'bytes' ? 'B' : unit === 'seconds' ? 's' : 'mm';
  const number = value !== 0 && value < 0.001 ? String(value) : new Intl.NumberFormat('en', { maximumSignificantDigits: 21 }).format(value);
  return { text: `${number} ${symbol}`, label: `${value} ${unit}` };
};
