import { Video, Repeat2 } from 'lucide-svelte';

export const cameraModeOptions = [
  { value: 'auto', label: 'Auto', icon: Repeat2 },
  { value: 'live', label: 'Live', icon: Video },
] as const;
