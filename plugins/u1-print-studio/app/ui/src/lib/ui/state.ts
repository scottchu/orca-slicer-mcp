export type WidgetState<T> =
  | { kind: 'loading' }
  | { kind: 'ready'; observation: T; refreshing?: boolean }
  | { kind: 'unavailable' }
  | { kind: 'error' };

export function validateWidgetState<T>(input: unknown, validate: (input: unknown) => T): WidgetState<T> {
  const value = input as WidgetState<T>;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid widget state');
  const allowed = value.kind === 'ready' ? ['kind', 'observation', 'refreshing'] : ['kind'];
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new Error('Invalid widget state fields');
  if (value.kind === 'ready') {
    if (value.refreshing !== undefined && typeof value.refreshing !== 'boolean') throw new Error('Invalid refresh state');
    return { kind: 'ready', observation: validate(value.observation), refreshing: value.refreshing ?? false };
  }
  if (value.kind !== 'loading' && value.kind !== 'unavailable' && value.kind !== 'error') throw new Error('Invalid widget state');
  return { kind: value.kind };
}
