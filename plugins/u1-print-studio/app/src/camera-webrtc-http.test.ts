import { afterEach, describe, expect, test } from "bun:test";
import { createServer, type Server } from "node:http";

import {
  createCameraStreamLocator,
  createCameraWebRtcHandler,
} from "./adapters/camera-webrtc-http.js";
import type {
  CameraIceCandidate,
  CameraWebRtcSignalingSource,
} from "./application/camera-webrtc.js";
import { CameraWebRtcSessionService } from "./application/camera-webrtc.js";
import { CameraRelayService } from "./application/camera-relay.js";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) => new Promise<void>((resolve) => server.close(() => resolve()))
    )
  );
});

async function startWebRtcServer() {
  let nextToken = 0;
  const answers: Array<{ id: string; sdp: string }> = [];
  const candidateBatches: Array<{
    id: string;
    candidates: CameraIceCandidate[];
  }> = [];
  const signaling: CameraWebRtcSignalingSource = {
    requestOffer: async () => ({
      type: "offer",
      id: "printer-peer-1",
      sdp: "v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n",
      iceServers: [],
    }),
    sendAnswer: async (id, sdp) => {
      answers.push({ id, sdp });
    },
    sendCandidates: async (id, candidates) => {
      candidateBatches.push({ id, candidates });
    },
  };
  const codec = {
      issue: () => {
        const token = `webrtc-ticket-${++nextToken}`;
        return { token, digest: `digest:${token}` };
      },
      digest: (token: string) => `digest:${token}`,
    };
  const relay = new CameraRelayService(
    codec,
    { maxConcurrentStreams: 1, maxStreamDurationMilliseconds: 10_000 }
  );
  const sessions = new CameraWebRtcSessionService(codec, signaling);
  const handler = createCameraWebRtcHandler(relay, sessions);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!(await handler(req, res, url.pathname, url))) res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  const origin = new URL(`http://127.0.0.1:${address.port}`);
  return { relay, origin, answers, candidateBatches };
}

describe("camera WebRTC HTTP adapter", () => {
  test("exchanges one ticket for a bounded signaling session", async () => {
    const { relay, origin, answers, candidateBatches } =
      await startWebRtcServer();
    const opened = relay.open(createCameraStreamLocator(origin));

    const preflight = await fetch(opened.url, { method: "OPTIONS" });
    expect(preflight.status).toBe(204);

    const offerResponse = await fetch(opened.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "request" }),
    });
    expect(offerResponse.status).toBe(200);
    expect(offerResponse.headers.get("access-control-allow-origin")).toBe("*");
    const offer = await offerResponse.json();
    expect(offer).toMatchObject({
      type: "offer",
      sdp: "v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n",
      iceServers: [],
    });
    expect(JSON.stringify(offer)).not.toContain("printer-peer-1");

    const answer = await fetch(opened.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "answer", sdp: "v=0\r\nanswer\r\n" }),
    });
    expect(answer.status).toBe(200);
    expect(answers).toEqual([
      { id: "printer-peer-1", sdp: "v=0\r\nanswer\r\n" },
    ]);

    const candidate = {
      candidate: "candidate:1 1 UDP 1 192.0.2.1 5000 typ host",
      sdpMid: "0",
      sdpMLineIndex: 0,
    };
    const candidates = await fetch(opened.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "remote_candidate",
        candidates: [candidate],
      }),
    });
    expect(candidates.status).toBe(200);
    expect(candidateBatches).toEqual([
      {
        id: "printer-peer-1",
        candidates: [{ ...candidate, usernameFragment: null }],
      },
    ]);

    const closed = await fetch(opened.url, { method: "DELETE" });
    expect(closed.status).toBe(200);
    expect(await closed.json()).toEqual({ closed: true });

    const replay = await fetch(opened.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "request" }),
    });
    expect(replay.status).toBe(401);
  });

  test("rejects unknown routes and arbitrary signaling messages", async () => {
    const { relay, origin } = await startWebRtcServer();
    const unknown = await fetch(new URL("/media/not-camera", origin));
    expect(unknown.status).toBe(404);
    const removedSnapshotLoop = await fetch(
      new URL("/media/camera.mjpeg?ticket=not-valid", origin)
    );
    expect(removedSnapshotLoop.status).toBe(404);

    const opened = relay.open(createCameraStreamLocator(origin));
    const arbitrary = await fetch(opened.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "configure_camera" }),
    });
    expect(arbitrary.status).toBe(400);
  });
});
