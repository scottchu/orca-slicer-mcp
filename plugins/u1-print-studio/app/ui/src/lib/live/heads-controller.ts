import { createObservationController } from './controller';
import { adaptHeads } from './heads-adapter';
import { headCardValue, headColor, type HeadId } from './heads-presentation';
import { createCopyAction } from './copy-action';
import type { ObservationPort } from './observation-port';
export const createHeadsController = (port: ObservationPort, writeText: (text: string) => Promise<void>, timeoutMs = 20_000) => {
  const observation = createObservationController(port, adaptHeads, 'Heads & Filaments', timeoutMs);
  const action = createCopyAction(writeText);
  const state = () => ({ ...observation.getState(), copying: action.getState().copying, feedback: action.getState().feedback || observation.getState().feedback });
  const listeners = new Set<(value: ReturnType<typeof state>) => void>();
  const publish = () => listeners.forEach((listener) => listener(state()));
  const stopObservation = observation.subscribe(() => { action.invalidate(); publish(); });
  const stopAction = action.subscribe(publish);
  return {
    getState: state,
    subscribe: (listener: (value: ReturnType<typeof state>) => void) => { listeners.add(listener); listener(state()); return () => { listeners.delete(listener); }; },
    start: observation.start,
    refresh: observation.refresh,
    copy: (id: HeadId, hex: string) => {
      const item = observation.getState().observation?.items.find((item) => item.physicalTool === id);
      if (!item || observation.getState().refreshing) return Promise.resolve();
      const card = headCardValue(item), color = headColor(card.presence, card.color).color;
      return color && color === hex ? action.copy(id, color) : Promise.resolve();
    },
    dispose: () => { stopObservation(); stopAction(); listeners.clear(); action.dispose(); observation.dispose(); },
  };
};
