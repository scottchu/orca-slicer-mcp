import { afterEach, describe, expect, test } from "bun:test";
import { createServer, get, type Server } from "node:http";

import { createCameraMediaHandler } from "./adapters/camera-media-http.js";
import { CameraRelayService } from "./application/camera-relay.js";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) => new Promise<void>((resolve) => server.close(() => resolve()))
    )
  );
});

async function startMediaServer() {
  let nextToken = 0;
  let nextFrame = 0;
  const relay = new CameraRelayService(
    {
      readFrame: async () => ({
        bytes: new Uint8Array([0xff, 0xd8, ++nextFrame, 0xff, 0xd9]),
        observedAt: `2026-08-25T20:00:0${nextFrame}.000Z`,
      }),
    },
    {
      issue: () => {
        const token = `ticket-${++nextToken}`;
        return { token, digest: `digest:${token}` };
      },
      digest: (token) => `digest:${token}`,
    },
    { frameIntervalMilliseconds: 1, maxConcurrentStreams: 1 }
  );
  const media = createCameraMediaHandler(relay);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!(await media(req, res, url.pathname, url))) res.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing address");
  return { relay, origin: `http://127.0.0.1:${address.port}` };
}

function requestBody(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () =>
        resolve({
          status: response.statusCode ?? 0,
          body: Buffer.concat(chunks).toString("utf8"),
        })
      );
    }).on("error", reject);
  });
}

function requestFirstFrame(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
        const bytes = Buffer.concat(chunks);
        if (bytes.indexOf(Buffer.from([0xff, 0xd8])) >= 0) {
          resolve(response.statusCode ?? 0);
          response.destroy();
        }
      });
    }).on("error", reject);
  });
}

describe("camera media HTTP adapter", () => {
  test("streams multiple JPEG parts over one request and rejects replay", async () => {
    const { relay, origin } = await startMediaServer();
    const opened = relay.open({
      locate: (token) => `${origin}/media/camera.mjpeg?ticket=${token}`,
    });

    const streamResult = await new Promise<{
      status: number;
      contentType: string;
      bytes: Buffer;
    }>((resolve, reject) => {
      get(opened.url, (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          const bytes = Buffer.concat(chunks);
          const boundaries = bytes.toString("latin1").match(/--u1-camera-frame/g);
          if ((boundaries?.length ?? 0) >= 2) {
            const value = {
              status: response.statusCode ?? 0,
              contentType: String(response.headers["content-type"]),
              bytes,
            };
            response.once("close", () => resolve(value));
            response.destroy();
          }
        });
      }).on("error", reject);
    });

    expect(streamResult.status).toBe(200);
    expect(streamResult.contentType).toBe(
      "multipart/x-mixed-replace; boundary=u1-camera-frame"
    );
    expect(
      streamResult.bytes.indexOf(Buffer.from([0xff, 0xd8, 1, 0xff, 0xd9]))
    ).toBeGreaterThanOrEqual(0);
    expect(
      streamResult.bytes.indexOf(Buffer.from([0xff, 0xd8, 2, 0xff, 0xd9]))
    ).toBeGreaterThanOrEqual(0);

    const replay = await requestBody(opened.url);
    expect(replay.status).toBe(401);
    expect(replay.body).toContain("invalid_camera_stream_ticket");

    await new Promise((resolve) => setTimeout(resolve, 0));
    const next = relay.open({
      locate: (token) => `${origin}/media/camera.mjpeg?ticket=${token}`,
    });
    expect(await requestFirstFrame(next.url)).toBe(200);
  });

  test("does not behave as a generic proxy", async () => {
    const { origin } = await startMediaServer();
    const response = await requestBody(`${origin}/media/anything-else`);
    expect(response.status).toBe(404);
  });
});
