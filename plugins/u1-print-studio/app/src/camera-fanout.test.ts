import { describe, expect, test } from "bun:test";

import {
  CameraFanoutSessionService,
  createCameraFanoutController,
  type CameraFanoutPeerFactory,
  type CameraFanoutUpstream,
  type CameraFanoutViewer,
} from "./application/camera-fanout.js";
import {
  CameraRelayClaimError,
  CameraRelayService,
  type CameraTicketCodec,
} from "./application/camera-relay.js";
import type {
  CameraIceCandidate,
  CameraIceServer,
  CameraWebRtcSignalingSource,
} from "./application/camera-webrtc.js";

function codec(tokens: string[]): CameraTicketCodec {
  return {
    issue: () => {
      const token = tokens.shift();
      if (!token) throw new Error("No test token available");
      return { token, digest: `digest:${token}` };
    },
    digest: (token) => `digest:${token}`,
  };
}

type FanoutFixture = {
  peers: CameraFanoutPeerFactory;
  upstreamOpenCount: () => number;
  upstreamCloseCount: () => number;
  viewers: CameraFanoutViewer[];
  viewerIceServers: CameraIceServer[][];
  terminateUpstream(): void;
};

function fanoutFixture(): FanoutFixture {
  let upstreamOpens = 0;
  let upstreamCloses = 0;
  let upstreamTermination: (() => void) | null = null;
  const viewers: CameraFanoutViewer[] = [];
  const viewerIceServers: CameraIceServer[][] = [];

  const peers: CameraFanoutPeerFactory = {
    openUpstream: async (signaling, signal) => {
      const offer = await signaling.requestOffer(signal);
      expect(offer.id).toBe("private-printer-peer-id");
      expect(offer.sdp).toContain("192.168.50.44");
      upstreamOpens += 1;
      return {
        track: { source: "private-printer-track" },
        close: () => { upstreamCloses += 1; },
        onTerminated: (callback) => {
          upstreamTermination = callback;
          return () => {
            if (upstreamTermination === callback) upstreamTermination = null;
          };
        },
      } satisfies CameraFanoutUpstream;
    },
    openViewer: async (_track, iceServers) => {
      viewerIceServers.push(iceServers);
      const index = viewers.length + 1;
      let termination: (() => void) | null = null;
      let closed = false;
      const viewer = {
        offerSdp:
          `v=0\r\na=ice-ufrag:server-viewer-${index}\r\n` +
          "a=candidate:1 1 UDP 1 100.91.2.3 50000 typ host\r\n",
        answer: async () => {},
        addCandidates: async (_candidates: CameraIceCandidate[]) => {},
        close: () => {
          if (closed) return;
          closed = true;
        },
        onTerminated: (callback: () => void) => {
          termination = callback;
          return () => {
            if (termination === callback) termination = null;
          };
        },
      } satisfies CameraFanoutViewer;
      viewers.push(viewer);
      return viewer;
    },
  };

  return {
    peers,
    upstreamOpenCount: () => upstreamOpens,
    upstreamCloseCount: () => upstreamCloses,
    viewers,
    viewerIceServers,
    terminateUpstream: () => upstreamTermination?.(),
  };
}

const signaling: CameraWebRtcSignalingSource = {
  requestOffer: async () => ({
    type: "offer",
    id: "private-printer-peer-id",
    sdp:
      "v=0\r\na=ice-ufrag:private-printer\r\n" +
      "a=candidate:1 1 UDP 1 192.168.50.44 60000 typ host\r\n",
    iceServers: [{
      urls: "turn:printer-lan.invalid:3478",
      username: "private-upstream-user",
      credential: "private-upstream-credential",
    }],
  }),
  sendAnswer: async () => {},
  sendCandidates: async () => {},
};

describe("server-terminated camera fan-out", () => {
  test("shares one private upstream across independent bounded viewers", async () => {
    const fixture = fanoutFixture();
    const ticketCodec = codec([
      "activation-one-opaque",
      "viewer-one-opaque",
      "activation-two-opaque",
      "viewer-two-opaque",
      "activation-three-opaque",
    ]);
    const relay = new CameraRelayService(ticketCodec, {
      maxConcurrentStreams: 2,
    });
    let viewerIceIssue = 0;
    const sessions = new CameraFanoutSessionService(
      ticketCodec,
      signaling,
      {
        issue: () => [{
          urls: "turns:relay.example:5349?transport=tcp",
          username: `viewer-${++viewerIceIssue}`,
          credential: `viewer-secret-${viewerIceIssue}`,
        }],
      },
      fixture.peers
    );
    const controller = createCameraFanoutController(relay, sessions);

    const firstActivation = controller.authorize();
    const first = await controller.open(firstActivation.token);
    const secondActivation = controller.authorize();
    const second = await controller.open(secondActivation.token);

    expect(fixture.upstreamOpenCount()).toBe(1);
    expect(fixture.viewers).toHaveLength(2);
    expect(first.sessionId).toBe("viewer-one-opaque");
    expect(second.sessionId).toBe("viewer-two-opaque");
    expect(first.iceServers[0]?.username).toBe("viewer-1");
    expect(second.iceServers[0]?.username).toBe("viewer-2");
    expect(fixture.viewerIceServers[0]).not.toEqual(
      fixture.viewerIceServers[1]
    );

    const publicEnvelope = JSON.stringify([first, second]);
    for (const privateUpstreamValue of [
      "192.168.50.44",
      "private-printer-peer-id",
      "private-printer",
      "printer-lan.invalid",
      "private-upstream-user",
      "private-upstream-credential",
    ]) {
      expect(publicEnvelope).not.toContain(privateUpstreamValue);
    }

    const thirdActivation = controller.authorize();
    await expect(controller.open(thirdActivation.token)).rejects.toThrow(
      new CameraRelayClaimError("busy")
    );

    expect(controller.close(first.sessionId)).toEqual({ closed: true });
    expect(fixture.upstreamCloseCount()).toBe(0);
    await controller.answer(second.sessionId, "viewer-two-answer");
    expect(controller.close(second.sessionId)).toEqual({ closed: true });
    expect(fixture.upstreamCloseCount()).toBe(1);
    expect(controller.close(first.sessionId)).toEqual({ closed: false });
  });

  test("releases unanswered viewers and the last upstream within the deadline", async () => {
    const fixture = fanoutFixture();
    const ticketCodec = codec(["unanswered-viewer"]);
    const relay = new CameraRelayService(ticketCodec, {
      maxConcurrentStreams: 1,
    });
    const sessions = new CameraFanoutSessionService(
      ticketCodec,
      signaling,
      { issue: () => [] },
      fixture.peers,
      { answerTimeoutMilliseconds: 10 }
    );

    const opened = await sessions.open(relay.claimDirect());
    expect(() => relay.claimDirect()).toThrow(new CameraRelayClaimError("busy"));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(sessions.close(opened.sessionId)).toEqual({ closed: false });
    expect(fixture.upstreamCloseCount()).toBe(1);
    const released = relay.claimDirect();
    released.release();
  });

  test("preserves opaque HTTP ticket session ids without exposing upstream data", async () => {
    const fixture = fanoutFixture();
    const ticketCodec = codec([]);
    const relay = new CameraRelayService(ticketCodec);
    const sessions = new CameraFanoutSessionService(
      ticketCodec,
      signaling,
      { issue: () => [] },
      fixture.peers
    );

    const lease = relay.claimDirect();
    const opened = await sessions.open(lease, "legacy-http-ticket-opaque");
    expect(opened.sessionId).toBe("legacy-http-ticket-opaque");
    expect(opened.sdp).toContain("100.91.2.3");
    expect(opened.sdp).not.toContain("192.168.50.44");
    const duplicateLease = relay.claimDirect();
    await expect(
      sessions.open(duplicateLease, "legacy-http-ticket-opaque")
    ).rejects.toThrow("invalid_session");
    expect(sessions.close(opened.sessionId)).toEqual({ closed: true });
  });

  test("tears down every viewer when the shared upstream terminates", async () => {
    const fixture = fanoutFixture();
    const ticketCodec = codec(["viewer-a", "viewer-b"]);
    const relay = new CameraRelayService(ticketCodec, {
      maxConcurrentStreams: 2,
    });
    const sessions = new CameraFanoutSessionService(
      ticketCodec,
      signaling,
      { issue: () => [] },
      fixture.peers
    );
    const first = await sessions.open(relay.claimDirect());
    const second = await sessions.open(relay.claimDirect());

    fixture.terminateUpstream();

    expect(sessions.close(first.sessionId)).toEqual({ closed: false });
    expect(sessions.close(second.sessionId)).toEqual({ closed: false });
    expect(fixture.upstreamCloseCount()).toBe(1);
  });
});
