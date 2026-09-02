export type SwitchOption<Value extends string> = Readonly<{ value: Value; label: string; icon: typeof import('lucide-svelte')['Box'] }>;
export type SwitchProps<Value extends string> = {
  label: string;
  options: readonly [SwitchOption<Value>, SwitchOption<Value>] | readonly [SwitchOption<Value>, SwitchOption<Value>, SwitchOption<Value>];
} & ({ loading: true; value?: never; onchange?: never; disabled?: never } | {
  loading?: false; value: Value; onchange: (value: Value) => void; disabled?: boolean;
});

export const validateSwitch = <Value extends string>(props: SwitchProps<Value>): SwitchProps<Value> => {
  if (typeof props.label !== 'string' || !props.label.trim() || !Array.isArray(props.options) || ![2, 3].includes(props.options.length)
    || props.options.some((option) => !option || typeof option.value !== 'string' || !option.value.trim() || typeof option.label !== 'string' || !option.label.trim() || typeof option.icon !== 'function')
    || new Set(props.options.map(option => option.value)).size !== props.options.length) throw new Error('Invalid Switch options');
  if (props.loading === true) {
    if (props.value !== undefined || props.onchange !== undefined || props.disabled !== undefined) throw new Error('Loading Switch must be inert');
  } else if ((props.loading !== undefined && props.loading !== false) || !props.options.some((option) => option.value === props.value)
    || typeof props.onchange !== 'function' || (props.disabled !== undefined && typeof props.disabled !== 'boolean')) throw new Error('Invalid Switch selection');
  return props;
};
