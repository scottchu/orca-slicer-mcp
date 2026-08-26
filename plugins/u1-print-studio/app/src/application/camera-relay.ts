export type CameraJpeg = {
  bytes: Uint8Array;
  observedAt: string;
};

export type CameraFrameSource = {
  readFrame(signal?: AbortSignal): Promise<CameraJpeg>;
};

export type CameraTicketCodec = {
  issue(): { token: string; digest: string };
  digest(token: string): string;
};

export type CameraStreamLocator = {
  locate(token: string): string;
};

export type OpenedCameraStream = {
  url: string;
  expiresAt: string;
  maxDurationSeconds: number;
};

export type CameraStreamLease = {
  frames(signal: AbortSignal): AsyncGenerator<CameraJpeg>;
  release(): void;
};

export type CameraRelayOptions = {
  ticketTtlMilliseconds?: number;
  frameIntervalMilliseconds?: number;
  maxStreamDurationMilliseconds?: number;
  maxConcurrentStreams?: number;
  maxPendingTickets?: number;
  now?: () => number;
  wait?: (milliseconds: number, signal: AbortSignal) => Promise<void>;
};

export type CameraRelayClaimFailure = "invalid" | "expired" | "busy";

export class CameraRelayClaimError extends Error {
  constructor(readonly reason: CameraRelayClaimFailure) {
    super(`Camera stream ticket ${reason}`);
  }
}

type PendingTicket = {
  expiresAt: number;
};

function defaultWait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, milliseconds);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export class CameraRelayService {
  private readonly pendingTickets = new Map<string, PendingTicket>();
  private readonly ticketTtlMilliseconds: number;
  private readonly frameIntervalMilliseconds: number;
  private readonly maxStreamDurationMilliseconds: number;
  private readonly maxConcurrentStreams: number;
  private readonly maxPendingTickets: number;
  private readonly now: () => number;
  private readonly wait: (milliseconds: number, signal: AbortSignal) => Promise<void>;
  private activeStreams = 0;

  constructor(
    private readonly frameSource: CameraFrameSource,
    private readonly ticketCodec: CameraTicketCodec,
    options: CameraRelayOptions = {}
  ) {
    this.ticketTtlMilliseconds = options.ticketTtlMilliseconds ?? 60_000;
    this.frameIntervalMilliseconds = options.frameIntervalMilliseconds ?? 250;
    this.maxStreamDurationMilliseconds =
      options.maxStreamDurationMilliseconds ?? 30 * 60_000;
    this.maxConcurrentStreams = options.maxConcurrentStreams ?? 2;
    this.maxPendingTickets = options.maxPendingTickets ?? 8;
    this.now = options.now ?? Date.now;
    this.wait = options.wait ?? defaultWait;
  }

  open(locator: CameraStreamLocator): OpenedCameraStream {
    this.removeExpiredTickets();
    if (this.pendingTickets.size >= this.maxPendingTickets) {
      throw new CameraRelayClaimError("busy");
    }

    const issued = this.ticketCodec.issue();
    const expiresAt = this.now() + this.ticketTtlMilliseconds;
    this.pendingTickets.set(issued.digest, { expiresAt });
    return {
      url: locator.locate(issued.token),
      expiresAt: new Date(expiresAt).toISOString(),
      maxDurationSeconds: Math.floor(this.maxStreamDurationMilliseconds / 1000),
    };
  }

  claim(token: string): CameraStreamLease {
    const digest = this.ticketCodec.digest(token);
    const pending = this.pendingTickets.get(digest);
    if (!pending) throw new CameraRelayClaimError("invalid");
    if (pending.expiresAt <= this.now()) {
      this.pendingTickets.delete(digest);
      throw new CameraRelayClaimError("expired");
    }
    if (this.activeStreams >= this.maxConcurrentStreams) {
      throw new CameraRelayClaimError("busy");
    }

    this.pendingTickets.delete(digest);
    this.activeStreams += 1;
    let released = false;
    return {
      frames: (signal) => this.frames(signal),
      release: () => {
        if (released) return;
        released = true;
        this.activeStreams -= 1;
      },
    };
  }

  private async *frames(signal: AbortSignal): AsyncGenerator<CameraJpeg> {
    const deadline = this.now() + this.maxStreamDurationMilliseconds;
    while (!signal.aborted && this.now() < deadline) {
      try {
        yield await this.frameSource.readFrame(signal);
      } catch {
        if (signal.aborted) return;
      }
      if (!signal.aborted && this.now() < deadline) {
        await this.wait(this.frameIntervalMilliseconds, signal);
      }
    }
  }

  private removeExpiredTickets(): void {
    const now = this.now();
    for (const [digest, ticket] of this.pendingTickets) {
      if (ticket.expiresAt <= now) this.pendingTickets.delete(digest);
    }
  }
}
