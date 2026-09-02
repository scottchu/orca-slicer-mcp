import { describe, expect, test } from "bun:test";

import {
  CameraWebRtcSessionError,
  CameraWebRtcSessionService,
  createCameraWebRtcSessionController,
  type CameraIceCandidate,
  type CameraWebRtcSignalingSource,
} from "../../src/lib/server/application/camera-webrtc.js";
import {
  CameraRelayClaimError,
  CameraRelayService,
  type CameraTicketCodec,
} from "../../src/lib/server/application/camera-relay.js";

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

describe("camera WebRTC session application service", () => {
  test("requires a one-time widget activation before allocating a session", async () => {
    const signaling: CameraWebRtcSignalingSource = {
      requestOffer: async () => ({
        type: "offer",
        id: "peer",
        sdp: "offer",
        iceServers: [],
      }),
      sendAnswer: async () => {},
      sendCandidates: async () => {},
    };
    const ticketCodec = codec([
      "opaque-widget-activation",
      "opaque-session-from-widget",
    ]);
    const relay = new CameraRelayService(ticketCodec);
    const sessions = new CameraWebRtcSessionService(ticketCodec, signaling);
    const controller = createCameraWebRtcSessionController(relay, sessions);

    await expect(controller.open("stale-empty-call")).rejects.toThrow(
      new CameraRelayClaimError("invalid")
    );
    const activation = controller.authorize();
    const opened = await controller.open(activation.token);
    expect(opened.sessionId).toBe("opaque-session-from-widget");
    await expect(controller.open(activation.token)).rejects.toThrow(
      new CameraRelayClaimError("invalid")
    );
    expect(controller.close(opened.sessionId)).toEqual({ closed: true });
  });

  test("automatically releases an unanswered session", async () => {
    const signaling: CameraWebRtcSignalingSource = {
      requestOffer: async () => ({
        type: "offer",
        id: "peer",
        sdp: "offer",
        iceServers: [],
      }),
      sendAnswer: async () => {},
      sendCandidates: async () => {},
    };
    const ticketCodec = codec(["unanswered-session"]);
    const relay = new CameraRelayService(ticketCodec, {
      maxConcurrentStreams: 1,
    });
    const sessions = new CameraWebRtcSessionService(ticketCodec, signaling, {
      answerTimeoutMilliseconds: 10,
    });
    const opened = await sessions.open(relay.claimDirect());
    expect(() => relay.claimDirect()).toThrow(new CameraRelayClaimError("busy"));

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(sessions.close(opened.sessionId)).toEqual({ closed: false });
    const released = relay.claimDirect();
    released.release();
  });

  test("bounds offer, answer, candidates, close, and printer peer privacy", async () => {
    const answers: Array<{ id: string; sdp: string }> = [];
    const candidateBatches: CameraIceCandidate[][] = [];
    const signaling: CameraWebRtcSignalingSource = {
      requestOffer: async () => ({
        type: "offer",
        id: "private-printer-peer-id",
        sdp: "v=0\r\nfixture-offer\r\n",
        iceServers: [],
      }),
      sendAnswer: async (id, sdp) => {
        answers.push({ id, sdp });
      },
      sendCandidates: async (_id, candidates) => {
        candidateBatches.push(candidates);
      },
    };
    const ticketCodec = codec(["opaque-session-token-1"]);
    const relay = new CameraRelayService(ticketCodec, {
      maxConcurrentStreams: 1,
      maxStreamDurationMilliseconds: 30_000,
    });
    const sessions = new CameraWebRtcSessionService(ticketCodec, signaling);

    const opened = await sessions.open(relay.claimDirect());
    expect(opened).toMatchObject({
      sessionId: "opaque-session-token-1",
      type: "offer",
      sdp: "v=0\r\nfixture-offer\r\n",
      maxDurationSeconds: 30,
    });
    expect(JSON.stringify(opened)).not.toContain("private-printer-peer-id");
    expect(() => relay.claimDirect()).toThrow(new CameraRelayClaimError("busy"));

    await sessions.answer(opened.sessionId, "v=0\r\nfixture-answer\r\n");
    await sessions.answer(opened.sessionId, "v=0\r\nfixture-answer\r\n");
    expect(answers).toEqual([
      { id: "private-printer-peer-id", sdp: "v=0\r\nfixture-answer\r\n" },
    ]);
    await expect(
      sessions.answer(opened.sessionId, "v=0\r\ndifferent-answer\r\n")
    ).rejects.toThrow(new CameraWebRtcSessionError("answer_already_set"));

    const candidate = { candidate: "candidate:fixture", sdpMid: "0" };
    expect(await sessions.addCandidates(opened.sessionId, [candidate])).toEqual({
      accepted: true,
      candidateCount: 1,
    });
    expect(await sessions.addCandidates(opened.sessionId, [candidate])).toEqual({
      accepted: true,
      candidateCount: 0,
    });
    expect(candidateBatches).toHaveLength(1);

    expect(sessions.close(opened.sessionId)).toEqual({ closed: true });
    expect(sessions.close(opened.sessionId)).toEqual({ closed: false });
    const next = relay.claimDirect();
    next.release();
  });

  test("expires sessions and rejects oversized candidate batches", async () => {
    let now = 1_000;
    const signaling: CameraWebRtcSignalingSource = {
      requestOffer: async () => ({
        type: "offer",
        id: "peer",
        sdp: "offer",
        iceServers: [],
      }),
      sendAnswer: async () => {},
      sendCandidates: async () => {},
    };
    const ticketCodec = codec(["opaque-session-token-2"]);
    const relay = new CameraRelayService(ticketCodec, {
      now: () => now,
      maxStreamDurationMilliseconds: 100,
    });
    const sessions = new CameraWebRtcSessionService(ticketCodec, signaling, {
      now: () => now,
    });
    const opened = await sessions.open(relay.claimDirect());

    await expect(
      sessions.addCandidates(
        opened.sessionId,
        Array.from({ length: 17 }, (_, index) => ({
          candidate: `candidate:${index}`,
        }))
      )
    ).rejects.toThrow(new CameraWebRtcSessionError("invalid_candidates"));
    now += 101;
    await expect(
      sessions.answer(opened.sessionId, "answer")
    ).rejects.toThrow(new CameraWebRtcSessionError("expired_session"));
    expect(sessions.close(opened.sessionId)).toEqual({ closed: false });
  });

  test("rejects oversized offers and non-ICE relay URLs before exposing them", async () => {
    for (const offer of [
      {
        type: "offer" as const,
        id: "peer",
        sdp: "x".repeat(96 * 1024 + 1),
        iceServers: [],
      },
      {
        type: "offer" as const,
        id: "peer",
        sdp: "offer",
        iceServers: [{ urls: "https://generic-proxy.example/relay" }],
      },
    ]) {
      const signaling: CameraWebRtcSignalingSource = {
        requestOffer: async () => offer,
        sendAnswer: async () => {},
        sendCandidates: async () => {},
      };
      const ticketCodec = codec([`opaque-session-${offer.sdp.length}`]);
      const relay = new CameraRelayService(ticketCodec);
      const sessions = new CameraWebRtcSessionService(ticketCodec, signaling);

      await expect(sessions.open(relay.claimDirect())).rejects.toThrow(
        new CameraWebRtcSessionError("invalid_offer")
      );
      const released = relay.claimDirect();
      released.release();
    }
  });

  test("closes a session that exceeds the cumulative ICE candidate budget", async () => {
    const signaling: CameraWebRtcSignalingSource = {
      requestOffer: async () => ({
        type: "offer",
        id: "peer",
        sdp: "offer",
        iceServers: [],
      }),
      sendAnswer: async () => {},
      sendCandidates: async () => {},
    };
    const ticketCodec = codec(["opaque-session-candidate-budget"]);
    const relay = new CameraRelayService(ticketCodec);
    const sessions = new CameraWebRtcSessionService(ticketCodec, signaling);
    const opened = await sessions.open(relay.claimDirect());

    for (let batch = 0; batch < 4; batch += 1) {
      await sessions.addCandidates(
        opened.sessionId,
        Array.from({ length: 16 }, (_, index) => ({
          candidate: `candidate:${batch}:${index}`,
        }))
      );
    }
    await expect(
      sessions.addCandidates(opened.sessionId, [{ candidate: "candidate:65" }])
    ).rejects.toThrow(new CameraWebRtcSessionError("invalid_candidates"));
    expect(sessions.close(opened.sessionId)).toEqual({ closed: false });
  });
});
