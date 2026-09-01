export const formatDurationValue = (seconds: number | null): { visible: string; accessible: string } => {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return { visible: '—', accessible: 'Duration not reported' };
  const accessible = `${seconds} seconds`;
  if (seconds > 0 && seconds < 0.001) return { visible: `${seconds.toExponential(1).replace('e+', 'e')}s`, accessible };
  if (seconds < 60) return { visible: `${Number(seconds.toFixed(3))}s`, accessible };
  if (seconds < 3600) return { visible: `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`, accessible };
  if (seconds < 86400) return { visible: `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`, accessible };
  const days = seconds / 86400;
  return { visible: days < 10000 ? `${Math.floor(days)}d ${Math.floor(seconds % 86400 / 3600)}h` : `${days.toExponential(1).replace('e+', 'e')}d`, accessible };
};
