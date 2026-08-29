import { describe, expect, test } from "bun:test";
import {
  Event,
  MediaStreamTrack,
  RTCPeerConnection,
  RtpHeader,
  RtpPacket,
  useH264,
  type RTCRtpCodecParameters,
} from "werift";

import {
  CameraFanoutSessionService,
  createCameraFanoutController,
  createWeriftCameraFanoutPeerFactory,
  selectH264CodecByPayloadType,
  waitForTrack,
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

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function asPeer(value: object): RTCPeerConnection {
  return value as RTCPeerConnection;
}

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

  test("rejects an opening viewer when its upstream generation terminates", async () => {
    const fixture = fanoutFixture();
    const enteredViewerOpen = deferred();
    const finishViewerOpen = deferred();
    const peers: CameraFanoutPeerFactory = {
      ...fixture.peers,
      openViewer: async (track, iceServers) => {
        enteredViewerOpen.resolve();
        await finishViewerOpen.promise;
        return fixture.peers.openViewer(track, iceServers);
      },
    };
    const ticketCodec = codec(["viewer-race"]);
    const relay = new CameraRelayService(ticketCodec);
    const sessions = new CameraFanoutSessionService(
      ticketCodec,
      signaling,
      { issue: () => [] },
      peers
    );

    const opening = sessions.open(relay.claimDirect());
    await enteredViewerOpen.promise;
    fixture.terminateUpstream();
    finishViewerOpen.resolve();

    await expect(opening).rejects.toThrow("invalid_offer");
    expect(fixture.upstreamCloseCount()).toBe(1);
    const released = relay.claimDirect();
    released.release();
  });

  test("does not insert a viewer that terminated during deferred opening", async () => {
    const fixture = fanoutFixture();
    const enteredViewerOpen = deferred();
    const finishViewerOpen = deferred();
    const peers: CameraFanoutPeerFactory = {
      ...fixture.peers,
      openViewer: async (track, iceServers) => {
        enteredViewerOpen.resolve();
        await finishViewerOpen.promise;
        const viewer = await fixture.peers.openViewer(track, iceServers);
        return {
          ...viewer,
          onTerminated: (callback: () => void) => {
            // The peer died while openViewer was awaited. A late observer must
            // report that terminal state before the session can be published.
            callback();
            return () => {};
          },
        } satisfies CameraFanoutViewer;
      },
    };
    const ticketCodec = codec(["dead-viewer-race"]);
    const relay = new CameraRelayService(ticketCodec);
    const sessions = new CameraFanoutSessionService(
      ticketCodec,
      signaling,
      { issue: () => [] },
      peers
    );

    const opening = sessions.open(relay.claimDirect());
    await enteredViewerOpen.promise;
    finishViewerOpen.resolve();

    await expect(opening).rejects.toThrow("invalid_offer");
    expect(fixture.upstreamCloseCount()).toBe(1);
    const released = relay.claimDirect();
    released.release();
  });
});

describe("werift camera fan-out adapter", () => {
  test("selects the exact H264 profile used by the first RTP payload", () => {
    const first = useH264({
      payloadType: 96,
      parameters: "profile-level-id=42e01f;packetization-mode=1",
    });
    const second = useH264({
      payloadType: 102,
      parameters: "profile-level-id=640c33;packetization-mode=1",
    });

    const selected = selectH264CodecByPayloadType([first, second], 102);
    expect(selected.payloadType).toBe(102);
    expect(selected.parameters).toBe(second.parameters);
    const duplicate = useH264({
      payloadType: 102,
      parameters: second.parameters,
    });
    expect(() =>
      selectH264CodecByPayloadType([second, duplicate], 102)
    ).toThrow("ambiguous or unsupported");
    const unsupported = useH264({ payloadType: 102 });
    unsupported.mimeType = "video/VP8";
    expect(() =>
      selectH264CodecByPayloadType([unsupported], 102)
    ).toThrow("ambiguous or unsupported");
  });

  test("cancels track and RTP waits on invalid SDP and sendAnswer failure", async () => {
    const invalidTrackEvent = new Event<[MediaStreamTrack]>();
    const invalidConnectionEvent = new Event<[
      "closed" | "disconnected" | "new" | "connected" | "failed" | "connecting"
    ]>();
    const invalidPeer = asPeer({
      onTrack: invalidTrackEvent,
      connectionStateChange: invalidConnectionEvent,
      addTransceiver: () => ({}),
      setRemoteDescription: async () => {
        throw new Error("invalid SDP");
      },
      close: async () => {},
    });
    const invalidFactory = createWeriftCameraFanoutPeerFactory({
      createPeer: () => invalidPeer,
    });

    await expect(
      invalidFactory.openUpstream(signaling, new AbortController().signal)
    ).rejects.toThrow("invalid SDP");
    expect(invalidTrackEvent.length).toBe(0);

    const track = new MediaStreamTrack({ kind: "video", remote: true });
    const trackEvent = new Event<[MediaStreamTrack]>();
    const connectionEvent = new Event<[
      "closed" | "disconnected" | "new" | "connected" | "failed" | "connecting"
    ]>();
    let localDescription: { type: "answer"; sdp: string } | undefined;
    const sendFailurePeer = asPeer({
      onTrack: trackEvent,
      connectionStateChange: connectionEvent,
      addTransceiver: () => ({}),
      setRemoteDescription: async () => trackEvent.execute(track),
      createAnswer: async () => ({ type: "answer", sdp: "answer" }),
      setLocalDescription: async (description: { type: "answer"; sdp: string }) => {
        localDescription = description;
      },
      get localDescription() {
        return localDescription;
      },
      close: async () => {},
    });
    const sendFailureFactory = createWeriftCameraFanoutPeerFactory({
      createPeer: () => sendFailurePeer,
    });
    const sendFailureSignaling: CameraWebRtcSignalingSource = {
      ...signaling,
      sendAnswer: async () => {
        throw new Error("sendAnswer failed");
      },
    };
    const baselineRtpListeners = track.onReceiveRtp.length;

    await expect(
      sendFailureFactory.openUpstream(
        sendFailureSignaling,
        new AbortController().signal
      )
    ).rejects.toThrow("sendAnswer failed");
    expect(trackEvent.length).toBe(0);
    expect(track.onReceiveRtp.length).toBe(baselineRtpListeners);
  });

  test("coalesces viewer PLIs onto the selected upstream receiver without closing peers", async () => {
    const upstreamTrack = new MediaStreamTrack({
      kind: "video",
      remote: true,
    });
    const upstreamTrackEvent = new Event<[MediaStreamTrack]>();
    const upstreamConnectionEvent = new Event<[
      "closed" | "disconnected" | "new" | "connected" | "failed" | "connecting"
    ]>();
    const codecs = [
      useH264({
        payloadType: 96,
        parameters: "profile-level-id=42e01f;packetization-mode=1",
      }),
      useH264({
        payloadType: 102,
        parameters: "profile-level-id=640c33;packetization-mode=1",
      }),
    ];
    let pliCount = 0;
    const receiver = {
      track: upstreamTrack,
      sendRtcpPLI: async (ssrc: number) => {
        expect(ssrc).toBe(0x1234);
        pliCount += 1;
      },
    };
    let upstreamLocalDescription:
      | { type: "answer"; sdp: string }
      | undefined;
    const upstreamPeer = asPeer({
      onTrack: upstreamTrackEvent,
      connectionStateChange: upstreamConnectionEvent,
      addTransceiver: () => ({}),
      setRemoteDescription: async () => upstreamTrackEvent.execute(upstreamTrack),
      createAnswer: async () => ({ type: "answer", sdp: "answer" }),
      setLocalDescription: async (description: { type: "answer"; sdp: string }) => {
        upstreamLocalDescription = description;
      },
      get localDescription() {
        return upstreamLocalDescription;
      },
      getTransceivers: () => [{ receiver, codecs }],
      close: async () => {},
    });
    const downstream = [0, 1].map(() => {
      const pli = new Event<[]>();
      const connection = new Event<[
        "closed" | "disconnected" | "new" | "connected" | "failed" | "connecting"
      ]>();
      let localDescription: { type: "offer"; sdp: string } | undefined;
      let closeCount = 0;
      return {
        pli,
        closeCount: () => closeCount,
        peer: asPeer({
          connectionStateChange: connection,
          addTransceiver: () => ({
            sender: {
              onPictureLossIndication: pli,
              replaceTrack: async () => {},
            },
          }),
          createOffer: async () => ({ type: "offer", sdp: "viewer-offer" }),
          setLocalDescription: async (description: {
            type: "offer";
            sdp: string;
          }) => {
            localDescription = description;
          },
          get localDescription() {
            return localDescription;
          },
          setRemoteDescription: async () => {},
          addIceCandidate: async () => {},
          close: async () => {
            closeCount += 1;
          },
        }),
      };
    });
    let peerIndex = 0;
    const factory = createWeriftCameraFanoutPeerFactory({
      pliIntervalMilliseconds: 10,
      createPeer: () =>
        peerIndex++ === 0 ? upstreamPeer : downstream[peerIndex - 2]!.peer,
    });
    const adapterSignaling: CameraWebRtcSignalingSource = {
      ...signaling,
      sendAnswer: async () => {
        upstreamTrack.onReceiveRtp.execute(
          new RtpPacket(
            new RtpHeader({ payloadType: 102, ssrc: 0x1234 }),
            Buffer.from([1])
          )
        );
      },
    };
    const upstream = await factory.openUpstream(
      adapterSignaling,
      new AbortController().signal
    );
    expect(
      (upstream.track as { codec: RTCRtpCodecParameters }).codec.parameters
    ).toBe(codecs[1]!.parameters);
    const first = await factory.openViewer(upstream.track, []);
    const second = await factory.openViewer(upstream.track, []);
    expect(downstream[0]!.pli.length).toBe(1);
    expect(downstream[1]!.pli.length).toBe(1);

    downstream[0]!.pli.execute();
    downstream[1]!.pli.execute();
    expect(pliCount).toBe(1);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(pliCount).toBe(2);
    first.close();
    expect(downstream[0]!.pli.length).toBe(0);
    expect(downstream[0]!.closeCount()).toBe(1);
    expect(downstream[1]!.closeCount()).toBe(0);
    downstream[1]!.pli.execute();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(pliCount).toBe(3);
    expect(downstream[1]!.closeCount()).toBe(0);

    second.close();
    expect(downstream[1]!.pli.length).toBe(0);
    upstream.close();
    expect(upstreamTrack.onReceiveRtp.length).toBe(0);
  });

  test("a directly cancelled track wait removes its timer subscription", () => {
    const peer = new RTCPeerConnection();
    const baseline = peer.onTrack.length;
    const wait = waitForTrack(peer, 60_000);
    expect(peer.onTrack.length).toBe(baseline + 1);
    wait.cancel();
    expect(peer.onTrack.length).toBe(baseline);
    void peer.close();
  });
});
