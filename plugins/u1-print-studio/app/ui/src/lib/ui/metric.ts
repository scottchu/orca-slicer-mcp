export const formatMetric = (value: number | null, unit: '%' | 'RPM') => {
  if (value === null || !Number.isFinite(value)) return {
    visible: 'N/A', accessible: unit === '%' ? 'Percentage unavailable' : 'Rotational speed unavailable'
  };
  const rounded = Math.round(value);
  return unit === '%'
    ? { visible: `${rounded}%`, accessible: `${rounded} percent` }
    : { visible: `${rounded.toLocaleString('en-US')} RPM`, accessible: `${rounded} revolutions per minute` };
};
