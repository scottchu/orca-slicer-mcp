import type { HostRpc } from '../host/rpc';
import { createHeadsController } from '../live/heads-controller';
import { observationPort } from '../live/observation-port';

export const createMcpHeads = (rpc: HostRpc) =>
  createHeadsController(
    observationPort(rpc, 'heads'),
    (text) =>
      navigator.clipboard?.writeText(text) ?? Promise.reject(new Error('Clipboard unavailable')),
  );
