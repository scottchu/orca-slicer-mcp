import { isIP } from "node:net";
import { networkInterfaces } from "node:os";

import { createCameraTicketCodec } from "./adapters/camera-ticket-codec.js";
import {
  type CameraWebRtcSignalingSource,
} from "./application/camera-webrtc.js";
import {
  CameraFanoutSessionService,
  createCameraFanoutController,
  createWeriftCameraFanoutPeerFactory,
  type CameraFanoutPeerFactory,
} from "./application/camera-fanout.js";
import { CameraRelayService } from "./application/camera-relay.js";
import type { CameraIceServerProvider } from "./camera-ice-config.js";
import { createU1CameraWebRtcSignaling } from "./u1-status.js";

export function createCameraRuntime(
  options: {
    signaling?: CameraWebRtcSignalingSource;
    iceServerProvider?: CameraIceServerProvider;
    peerFactory?: CameraFanoutPeerFactory;
    maxViewers?: number;
    downstreamAdditionalHostAddresses?: string[];
  } = {}
) {
  const iceServerProvider = options.iceServerProvider ?? {
    hasStun: false,
    hasTurn: false,
    turnCredentialTtlSeconds: null,
    issue: () => [],
  };
  const signaling = options.signaling ??
    createU1CameraWebRtcSignaling(iceServerProvider);
  const codec = createCameraTicketCodec();
  const maxViewers = options.maxViewers ?? 16;
  if (!Number.isInteger(maxViewers) || maxViewers < 1 || maxViewers > 64) {
    throw new Error("Camera fan-out maxViewers must be an integer from 1 to 64");
  }
  const relay = new CameraRelayService(codec, {
    maxConcurrentStreams: maxViewers,
    maxPendingTickets: Math.max(8, maxViewers),
  });
  const sessions = new CameraFanoutSessionService(
    codec,
    signaling,
    iceServerProvider,
    options.peerFactory ??
      createWeriftCameraFanoutPeerFactory({
        downstreamAdditionalHostAddresses:
          options.downstreamAdditionalHostAddresses,
      })
  );
  return {
    relay,
    sessions,
    controller: createCameraFanoutController(relay, sessions),
    close: () => sessions.dispose(),
  };
}

const MAX_VIEWERS = 64;
const DEFAULT_MAX_VIEWERS = 16;

export function cameraMaxViewersFromEnvironment(
  environment: NodeJS.ProcessEnv = process.env
): number {
  const raw = environment.U1_CAMERA_MAX_VIEWERS?.trim();
  if (!raw) return DEFAULT_MAX_VIEWERS;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > MAX_VIEWERS) {
    throw new Error("U1_CAMERA_MAX_VIEWERS must be an integer from 1 to 64");
  }
  return value;
}

function isTailscaleIpv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [first, second] = address.split(".").map(Number);
  return first === 100 && second >= 64 && second <= 127;
}

function isTailscaleIpv6(address: string): boolean {
  return isIP(address) === 6 &&
    address.toLowerCase().startsWith("fd7a:115c:a1e0:");
}

/**
 * werift intentionally excludes tun interfaces from normal host gathering.
 * Add the machine's Tailscale IPv4 address explicitly so a tailnet-connected
 * mobile viewer can use a direct host candidate without requiring TURN.
 */
export function tailscaleHostAddresses(
  interfaces = networkInterfaces()
): string[] {
  return [
    ...new Set(
      Object.values(interfaces)
        .flatMap((entries) => entries ?? [])
        .filter(
          (entry) =>
            !entry.internal &&
            (isTailscaleIpv4(entry.address) || isTailscaleIpv6(entry.address))
        )
        .map((entry) => entry.address)
    ),
  ];
}
