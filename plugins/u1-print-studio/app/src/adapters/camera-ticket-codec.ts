import { createHash, randomBytes } from "node:crypto";

import type { CameraTicketCodec } from "../application/camera-relay.js";

function digest(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("base64url");
}

export function createCameraTicketCodec(): CameraTicketCodec {
  return {
    issue: () => {
      const token = randomBytes(32).toString("base64url");
      return { token, digest: digest(token) };
    },
    digest,
  };
}
