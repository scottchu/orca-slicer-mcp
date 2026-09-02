import type { IncomingMessage, ServerResponse } from 'node:http';

export type RequestLifetime = {
  signal: AbortSignal;
  /** Hold a newly created resource until its response is delivered. */
  onAborted: (release: () => void) => void;
};

// Bun 1.4.0 supplies Node response/socket close after a complete request body.
// The transport owns cancellation; a successful HTTP finish transfers a new
// lease to its consumer, without claiming client receipt or media acceptance.
export const createRequestLifetime = (req: IncomingMessage, res: ServerResponse): RequestLifetime => {
  const controller = new AbortController();
  const releases = new Set<() => void>();
  let settled = false;
  const clean = (): void => {
    req.off('aborted', abort); req.off('error', abort);
    res.off('close', abort); res.off('error', abort); req.socket.off('close', abort);
    res.off('finish', delivered);
  };
  const abort = (): void => {
    if (settled) return;
    settled = true;
    controller.abort();
    try { for (const release of releases) release(); }
    finally { releases.clear(); clean(); }
  };
  const delivered = (): void => {
    settled = true; releases.clear(); clean();
  };
  req.once('aborted', abort); req.once('error', abort);
  res.once('close', abort); res.once('error', abort); req.socket.once('close', abort);
  res.once('finish', delivered);
  return {
    signal: controller.signal,
    onAborted: (release) => {
      if (controller.signal.aborted) release();
      else if (!settled) releases.add(release);
    }
  };
};
