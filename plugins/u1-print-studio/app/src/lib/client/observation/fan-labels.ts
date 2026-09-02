import type { FanReading } from './types';
export const fanNames: Record<FanReading['id'], string> = {
  'tool-1-part': 'Tool 1', 'tool-2-part': 'Tool 2', 'tool-3-part': 'Tool 3', 'tool-4-part': 'Tool 4',
  cavity: 'Cavity', 'purifier-exhaust': 'Purifier exhaust', 'purifier-inner': 'Purifier inner'
};
export const fanIds = Object.keys(fanNames) as FanReading['id'][];
