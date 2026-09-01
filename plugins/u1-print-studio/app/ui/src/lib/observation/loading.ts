export const loadingObservation = <T>(loading: boolean, observation: unknown, validate: (value: unknown) => T): T | null => {
  if (typeof loading !== 'boolean' || (loading && observation !== undefined)) throw new Error('Invalid loading observation');
  return loading ? null : validate(observation);
};
export const structureCount = (value: number, maximum: number): number => {
  if (!Number.isInteger(value) || value < 0 || value > maximum) throw new Error('Invalid loading structure');
  return value;
};
