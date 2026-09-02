import type { KitHandler } from './kit-transport.js';

export const loadKitHandler = async (file: string): Promise<KitHandler> => {
  // The original MCP SDK Node transport had no 512 KiB body cap. Disable only
  // the adapter's additional global cap; OAuth, dashboard tools and signaling
  // retain their existing explicit 128 KiB readers. This is process-local and
  // intentionally does not load or modify user environment files.
  process.env.U1_KIT_BODY_SIZE_LIMIT = 'Infinity';
  const module = await import(file) as { handler: KitHandler };
  return module.handler;
};
