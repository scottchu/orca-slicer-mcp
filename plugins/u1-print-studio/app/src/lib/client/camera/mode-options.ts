import { Camera, Video, Repeat2 } from 'lucide-svelte';

export const cameraModeOptions = [
  { value: 'snapshot', label: 'Snapshot', icon: Camera },
  { value: 'live', label: 'Live', icon: Video },
  { value: 'auto', label: 'Auto', icon: Repeat2 },
] as const;
