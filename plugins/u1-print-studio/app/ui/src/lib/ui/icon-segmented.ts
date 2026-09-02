export type IconOption<Value extends string> = Readonly<{ value: Value; label: string; icon: typeof import('lucide-svelte')['Box'] }>;
export type IconSegmentedProps<Value extends string> = {
  label: string;
  options: readonly [IconOption<Value>, IconOption<Value>];
} & ({ loading: true; value?: never; onchange?: never; disabled?: never } | {
  loading?: false; value: Value; onchange: (value: Value) => void; disabled?: boolean;
});

export const validateIconSegmented = <Value extends string>(props: IconSegmentedProps<Value>): IconSegmentedProps<Value> => {
  if (typeof props.label !== 'string' || !props.label.trim() || !Array.isArray(props.options) || props.options.length !== 2
    || props.options.some((option) => !option || typeof option.value !== 'string' || !option.value.trim() || typeof option.label !== 'string' || !option.label.trim() || typeof option.icon !== 'function')
    || props.options[0].value === props.options[1].value) throw new Error('Invalid icon segmented options');
  if (props.loading === true) {
    if (props.value !== undefined || props.onchange !== undefined || props.disabled !== undefined) throw new Error('Loading icon segments must be inert');
  } else if ((props.loading !== undefined && props.loading !== false) || !props.options.some((option) => option.value === props.value)
    || typeof props.onchange !== 'function' || (props.disabled !== undefined && typeof props.disabled !== 'boolean')) throw new Error('Invalid icon segmented selection');
  return props;
};
