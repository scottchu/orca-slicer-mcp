import { createHmac, randomBytes } from "node:crypto";

import type { CameraIceServer } from "./application/camera-webrtc.js";

const MAX_URLS = 4;
const MAX_URL_BYTES = 1_024;
const MIN_TURN_SECRET_BYTES = 16;
const MAX_TURN_SECRET_BYTES = 4_096;
const DEFAULT_TURN_TTL_SECONDS = 1_800;
// The bounded camera lease is 30 minutes. Credentials must remain renewable
// for at least that lease and may extend by at most another 30 minutes.
const MIN_TURN_TTL_SECONDS = 1_800;
const MAX_TURN_TTL_SECONDS = 3_600;

export type CameraIceServerProvider = {
  readonly hasStun: boolean;
  readonly hasTurn: boolean;
  readonly turnCredentialTtlSeconds: number | null;
  issue(): CameraIceServer[];
};

type ProviderOptions = {
  now?: () => number;
  nonce?: () => string;
  configuredStunUrls?: string[];
};

function parseUrlList(
  variable: string,
  raw: string | undefined,
  protocols: readonly string[]
): string[] {
  if (!raw?.trim()) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(`${variable} must be a JSON array of ICE server URLs`);
  }
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > MAX_URLS ||
    value.some((url) => typeof url !== "string")
  ) {
    throw new Error(`${variable} must contain between one and ${MAX_URLS} URLs`);
  }
  const urls = [...new Set(value as string[])];
  if (urls.length !== value.length) {
    throw new Error(`${variable} cannot contain duplicate URLs`);
  }
  for (const url of urls) {
    const scheme = /^([a-z]+):/i.exec(url)?.[1]?.toLowerCase();
    const address = scheme
      ? url.slice(scheme.length + 1).split("?", 1)[0]
      : "";
    const addressMatch = /^(?:[A-Za-z0-9.-]+|\[[0-9A-Fa-f:]+\])(?::([0-9]{1,5}))?$/.exec(
      address
    );
    const port = addressMatch?.[1] ? Number(addressMatch[1]) : null;
    if (
      !scheme ||
      !protocols.includes(scheme) ||
      Buffer.byteLength(url) > MAX_URL_BYTES ||
      /[\s@#]/.test(url) ||
      !addressMatch ||
      (port !== null && (port < 1 || port > 65_535))
    ) {
      throw new Error(`${variable} contains an invalid ICE server URL`);
    }
    const query = url.split("?", 2)[1];
    if (query && !/^transport=(udp|tcp)$/i.test(query)) {
      throw new Error(`${variable} contains an unsupported URL parameter`);
    }
  }
  return urls;
}

export function normalizeStunUrls(
  value: unknown,
  label = "camera.stunUrls"
): string[] {
  if (!Array.isArray(value) || value.some((url) => typeof url !== "string")) {
    throw new Error(`${label} must be an array of STUN URLs`);
  }
  if (value.length === 0) return [];
  return parseUrlList(label, JSON.stringify(value), ["stun", "stuns"]);
}

function parseTurnTtl(raw: string | undefined): number {
  if (!raw?.trim()) return DEFAULT_TURN_TTL_SECONDS;
  const value = Number(raw);
  if (
    !Number.isInteger(value) ||
    value < MIN_TURN_TTL_SECONDS ||
    value > MAX_TURN_TTL_SECONDS
  ) {
    throw new Error(
      `U1_TURN_CREDENTIAL_TTL_SECONDS must be an integer from ${MIN_TURN_TTL_SECONDS} to ${MAX_TURN_TTL_SECONDS}`
    );
  }
  return value;
}

export function createCameraIceServerProvider(
  environment: NodeJS.ProcessEnv = process.env,
  options: ProviderOptions = {}
): CameraIceServerProvider {
  const stunUrls = environment.U1_STUN_URLS_JSON?.trim()
    ? parseUrlList(
        "U1_STUN_URLS_JSON",
        environment.U1_STUN_URLS_JSON,
        ["stun", "stuns"]
      )
    : normalizeStunUrls(options.configuredStunUrls ?? []);
  const turnUrls = parseUrlList(
    "U1_TURN_URLS_JSON",
    environment.U1_TURN_URLS_JSON,
    ["turn", "turns"]
  );
  const sharedSecret = environment.U1_TURN_SHARED_SECRET?.trim() ?? "";
  const ttlWasConfigured = Boolean(
    environment.U1_TURN_CREDENTIAL_TTL_SECONDS?.trim()
  );
  const turnWasRequested =
    turnUrls.length > 0 || sharedSecret.length > 0 || ttlWasConfigured;

  if (turnWasRequested && (turnUrls.length === 0 || sharedSecret.length === 0)) {
    throw new Error(
      "TURN requires both U1_TURN_URLS_JSON and U1_TURN_SHARED_SECRET"
    );
  }
  if (
    sharedSecret &&
    (Buffer.byteLength(sharedSecret) < MIN_TURN_SECRET_BYTES ||
      Buffer.byteLength(sharedSecret) > MAX_TURN_SECRET_BYTES)
  ) {
    throw new Error("U1_TURN_SHARED_SECRET has an invalid length");
  }

  const ttlSeconds = turnWasRequested ? parseTurnTtl(
    environment.U1_TURN_CREDENTIAL_TTL_SECONDS
  ) : null;
  const now = options.now ?? Date.now;
  const nonce = options.nonce ?? (() => randomBytes(12).toString("base64url"));

  return {
    hasStun: stunUrls.length > 0,
    hasTurn: turnUrls.length > 0,
    turnCredentialTtlSeconds: ttlSeconds,
    issue(): CameraIceServer[] {
      const servers: CameraIceServer[] = [];
      if (stunUrls.length > 0) servers.push({ urls: [...stunUrls] });
      if (turnUrls.length > 0 && ttlSeconds !== null) {
        const expiresAt = Math.floor(now() / 1_000) + ttlSeconds;
        const username = `${expiresAt}:${nonce()}`;
        const credential = createHmac("sha1", sharedSecret)
          .update(username)
          .digest("base64");
        servers.push({
          urls: [...turnUrls],
          username,
          credential,
        });
      }
      return servers;
    },
  };
}
