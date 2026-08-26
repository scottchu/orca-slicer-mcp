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
  expiresAt: string;
  release(): void;
};

export type CameraRelayOptions = {
  ticketTtlMilliseconds?: number;
  maxStreamDurationMilliseconds?: number;
  maxConcurrentStreams?: number;
  maxPendingTickets?: number;
  now?: () => number;
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

export class CameraRelayService {
  private readonly pendingTickets = new Map<string, PendingTicket>();
  private readonly ticketTtlMilliseconds: number;
  private readonly maxStreamDurationMilliseconds: number;
  private readonly maxConcurrentStreams: number;
  private readonly maxPendingTickets: number;
  private readonly now: () => number;
  private activeStreams = 0;

  constructor(
    private readonly ticketCodec: CameraTicketCodec,
    options: CameraRelayOptions = {}
  ) {
    this.ticketTtlMilliseconds = options.ticketTtlMilliseconds ?? 60_000;
    this.maxStreamDurationMilliseconds =
      options.maxStreamDurationMilliseconds ?? 30 * 60_000;
    this.maxConcurrentStreams = options.maxConcurrentStreams ?? 2;
    this.maxPendingTickets = options.maxPendingTickets ?? 8;
    this.now = options.now ?? Date.now;
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
    const expiresAt = this.now() + this.maxStreamDurationMilliseconds;
    let released = false;
    return {
      expiresAt: new Date(expiresAt).toISOString(),
      release: () => {
        if (released) return;
        released = true;
        this.activeStreams -= 1;
      },
    };
  }

  private removeExpiredTickets(): void {
    const now = this.now();
    for (const [digest, ticket] of this.pendingTickets) {
      if (ticket.expiresAt <= now) this.pendingTickets.delete(digest);
    }
  }
}
