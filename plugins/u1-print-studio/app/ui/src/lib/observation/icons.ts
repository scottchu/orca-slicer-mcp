import { Bed, Box, Camera, Fan, FileClock, Grid3X3, History, Layers3, LayoutDashboard, ListOrdered, Printer, RefreshCw, Spool, Thermometer, ThermometerSun } from 'lucide-svelte';

export const observationIcons = { bed: Bed, box: Box, camera: Camera, fan: Fan, jobs: FileClock, mesh: Grid3X3, history: History, heads: Layers3, overview: LayoutDashboard, queue: ListOrdered, progress: Printer, refresh: RefreshCw, spool: Spool, thermometer: Thermometer, thermals: ThermometerSun };
export type ObservationIconName = keyof typeof observationIcons;
