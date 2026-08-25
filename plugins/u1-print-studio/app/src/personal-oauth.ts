import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  Base64URLString,
  RegistrationResponseJSON,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  jwtVerify,
  SignJWT,
  type JWK,
} from "jose";

export const MONITOR_SCOPE = "u1.monitor";
const STATE_VERSION = 1;
const AUTH_REQUEST_TTL_MS = 5 * 60_000;
const AUTH_CODE_TTL_MS = 60_000;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const MAX_BODY_BYTES = 128 * 1024;

type StoredCredential = {
  id: Base64URLString;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
};

type RegisteredClient = {
  clientId: string;
  redirectUris: string[];
  clientName: string;
  createdAt: string;
};

type StoredState = {
  version: 1;
  signingPrivateJwk: JWK;
  signingPublicJwk: JWK;
  credential?: StoredCredential;
  clients: Record<string, RegisteredClient>;
};

type PendingAuthorization = {
  id: string;
  clientId: string;
  redirectUri: string;
  state: string;
  scope: string;
  resource: string;
  codeChallenge: string;
  challenge?: string;
  expiresAt: number;
};

type AuthorizationCode = {
  clientId: string;
  redirectUri: string;
  scope: string;
  resource: string;
  codeChallenge: string;
  expiresAt: number;
};

export type PersonalOAuthConfig = {
  publicBaseUrl: string;
  stateDirectory?: string;
  ownerName?: string;
  enrollmentToken?: string;
  allowedRedirectOrigins?: string[];
  now?: () => number;
};

function normalizedBaseUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("U1_PUBLIC_BASE_URL must use https");
  }
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/$/, "");
  return url;
}

function sha256(value: string | Buffer): Buffer {
  return createHash("sha256").update(value).digest();
}

function base64url(value: Buffer): string {
  return value.toString("base64url");
}

export function pkceChallenge(verifier: string): string {
  return base64url(sha256(verifier));
}

function secureEqual(left: string, right: string): boolean {
  const leftBytes = sha256(left);
  const rightBytes = sha256(right);
  return timingSafeEqual(leftBytes, rightBytes);
}

function html(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(body));
}

function writeHtml(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-security-policy":
      "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    "content-type": "text/html; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  });
  res.end(body);
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.length;
    if (total > MAX_BODY_BYTES) throw new Error("Request body too large");
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  return JSON.parse((await readBody(req)).toString("utf8")) as T;
}

async function readForm(req: IncomingMessage): Promise<URLSearchParams> {
  return new URLSearchParams((await readBody(req)).toString("utf8"));
}

function credentialFromStored(value: StoredCredential): WebAuthnCredential {
  return {
    id: value.id,
    publicKey: Buffer.from(value.publicKey, "base64url"),
    counter: value.counter,
    transports: value.transports,
  };
}

function page(title: string, body: string, script = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${html(title)}</title>
  <style>
    :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; }
    body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #eef8f4; color: #12221c; }
    main { box-sizing: border-box; width: min(92vw, 430px); padding: 28px; border: 1px solid #cfe3da; border-radius: 24px; background: white; box-shadow: 0 18px 60px #0b3a2620; }
    h1 { margin: 0 0 10px; font-size: 26px; }
    p { line-height: 1.45; color: #506158; }
    button { width: 100%; min-height: 52px; border: 0; border-radius: 999px; background: #087f5b; color: white; font: inherit; font-weight: 700; }
    button:disabled { opacity: .55; }
    #message { min-height: 1.5em; font-size: 14px; }
    @media (prefers-color-scheme: dark) { body { background: #07130f; color: #ecfff6; } main { background: #10251d; border-color: #284b3e; } p { color: #b8ccc3; } }
  </style>
</head>
<body><main>${body}</main>${script ? `<script>${script}</script>` : ""}</body>
</html>`;
}

const browserHelpers = String.raw`
const b64urlToBytes = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};
const bytesToB64url = (value) => {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const registrationOptions = (options) => ({
  ...options,
  challenge: b64urlToBytes(options.challenge),
  user: { ...options.user, id: b64urlToBytes(options.user.id) },
  excludeCredentials: (options.excludeCredentials || []).map((item) => ({ ...item, id: b64urlToBytes(item.id) })),
});
const authenticationOptions = (options) => ({
  ...options,
  challenge: b64urlToBytes(options.challenge),
  allowCredentials: (options.allowCredentials || []).map((item) => ({ ...item, id: b64urlToBytes(item.id) })),
});
const registrationResponse = (credential) => ({
  id: credential.id,
  rawId: bytesToB64url(credential.rawId),
  type: credential.type,
  authenticatorAttachment: credential.authenticatorAttachment,
  clientExtensionResults: credential.getClientExtensionResults(),
  response: {
    clientDataJSON: bytesToB64url(credential.response.clientDataJSON),
    attestationObject: bytesToB64url(credential.response.attestationObject),
    transports: credential.response.getTransports ? credential.response.getTransports() : [],
  },
});
const authenticationResponse = (credential) => ({
  id: credential.id,
  rawId: bytesToB64url(credential.rawId),
  type: credential.type,
  authenticatorAttachment: credential.authenticatorAttachment,
  clientExtensionResults: credential.getClientExtensionResults(),
  response: {
    authenticatorData: bytesToB64url(credential.response.authenticatorData),
    clientDataJSON: bytesToB64url(credential.response.clientDataJSON),
    signature: bytesToB64url(credential.response.signature),
    userHandle: credential.response.userHandle ? bytesToB64url(credential.response.userHandle) : undefined,
  },
});`;

export class PersonalOAuthService {
  readonly publicBaseUrl: URL;
  readonly basePath: string;
  readonly issuer: string;
  readonly resource: string;
  readonly rpId: string;
  readonly expectedOrigin: string;
  readonly enrollmentUrl: string | null;
  readonly enrollmentLinkPath: string;

  private state: StoredState;
  private readonly statePath: string;
  private readonly ownerName: string;
  private readonly enrollmentToken: string | null;
  private enrollmentChallenge: string | null = null;
  private readonly allowedRedirectOrigins: Set<string>;
  private readonly now: () => number;
  private readonly signingKey: CryptoKey | Uint8Array;
  private readonly verificationKey: CryptoKey | Uint8Array;
  private readonly authorizations = new Map<string, PendingAuthorization>();
  private readonly codes = new Map<string, AuthorizationCode>();

  private constructor(args: {
    config: PersonalOAuthConfig;
    state: StoredState;
    statePath: string;
    enrollmentLinkPath: string;
    enrollmentToken: string | null;
    signingKey: CryptoKey | Uint8Array;
    verificationKey: CryptoKey | Uint8Array;
  }) {
    this.publicBaseUrl = normalizedBaseUrl(args.config.publicBaseUrl);
    this.basePath = this.publicBaseUrl.pathname === "/"
      ? ""
      : this.publicBaseUrl.pathname;
    this.issuer = this.publicBaseUrl.toString();
    this.resource = new URL(`${this.basePath}/mcp`, this.publicBaseUrl.origin).toString();
    this.rpId = this.publicBaseUrl.hostname;
    this.expectedOrigin = this.publicBaseUrl.origin;
    this.ownerName = args.config.ownerName ?? "U1 owner";
    this.state = args.state;
    this.statePath = args.statePath;
    this.enrollmentLinkPath = args.enrollmentLinkPath;
    this.enrollmentToken = args.enrollmentToken;
    this.enrollmentUrl = this.state.credential || !this.enrollmentToken
      ? null
      : new URL(
          `${this.basePath}/auth/enroll?token=${encodeURIComponent(this.enrollmentToken)}`,
          this.publicBaseUrl.origin
        ).toString();
    this.allowedRedirectOrigins = new Set(
      args.config.allowedRedirectOrigins ?? ["https://chatgpt.com"]
    );
    this.now = args.config.now ?? Date.now;
    this.signingKey = args.signingKey;
    this.verificationKey = args.verificationKey;
  }

  static async create(config: PersonalOAuthConfig): Promise<PersonalOAuthService> {
    const stateDirectory =
      config.stateDirectory ??
      path.join(homedir(), ".local", "share", "u1-print-studio");
    mkdirSync(stateDirectory, { recursive: true, mode: 0o700 });
    const statePath = path.join(stateDirectory, "personal-oauth.json");
    let state: StoredState;

    try {
      state = JSON.parse(readFileSync(statePath, "utf8")) as StoredState;
      if (state.version !== STATE_VERSION) throw new Error("Unsupported auth state");
    } catch (error) {
      if (error instanceof SyntaxError) throw error;
      const { privateKey, publicKey } = await generateKeyPair("ES256", {
        extractable: true,
      });
      const kid = randomUUID();
      const signingPrivateJwk = await exportJWK(privateKey);
      const signingPublicJwk = await exportJWK(publicKey);
      signingPrivateJwk.kid = kid;
      signingPrivateJwk.alg = "ES256";
      signingPrivateJwk.use = "sig";
      signingPublicJwk.kid = kid;
      signingPublicJwk.alg = "ES256";
      signingPublicJwk.use = "sig";
      state = {
        version: STATE_VERSION,
        signingPrivateJwk,
        signingPublicJwk,
        clients: {},
      };
      PersonalOAuthService.persistState(statePath, state);
    }

    const enrollmentToken = state.credential
      ? null
      : config.enrollmentToken ?? base64url(randomBytes(32));
    const service = new PersonalOAuthService({
      config,
      state,
      statePath,
      enrollmentLinkPath: path.join(stateDirectory, "enrollment-url.txt"),
      enrollmentToken,
      signingKey: await importJWK(state.signingPrivateJwk, "ES256"),
      verificationKey: await importJWK(state.signingPublicJwk, "ES256"),
    });
    if (service.enrollmentUrl) {
      writeFileSync(service.enrollmentLinkPath, `${service.enrollmentUrl}\n`, {
        mode: 0o600,
      });
    } else {
      rmSync(service.enrollmentLinkPath, { force: true });
    }
    return service;
  }

  private static persistState(statePath: string, state: StoredState): void {
    const temporaryPath = `${statePath}.${process.pid}.tmp`;
    writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, {
      mode: 0o600,
    });
    renameSync(temporaryPath, statePath);
  }

  private persist(): void {
    PersonalOAuthService.persistState(this.statePath, this.state);
  }

  protectedResourceMetadata() {
    return {
      resource: this.resource,
      authorization_servers: [this.issuer],
      scopes_supported: [MONITOR_SCOPE],
    };
  }

  authorizationServerMetadata() {
    return {
      issuer: this.issuer,
      authorization_endpoint: new URL(
        `${this.basePath}/oauth/authorize`,
        this.publicBaseUrl.origin
      ).toString(),
      token_endpoint: new URL(
        `${this.basePath}/oauth/token`,
        this.publicBaseUrl.origin
      ).toString(),
      registration_endpoint: new URL(
        `${this.basePath}/oauth/register`,
        this.publicBaseUrl.origin
      ).toString(),
      jwks_uri: new URL(
        `${this.basePath}/.well-known/jwks.json`,
        this.publicBaseUrl.origin
      ).toString(),
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      scopes_supported: [MONITOR_SCOPE],
      authorization_response_iss_parameter_supported: true,
    };
  }

  challenge(error = "invalid_token", description = "Authentication required"): string {
    const metadata = new URL(
      `${this.basePath}/.well-known/oauth-protected-resource`,
      this.publicBaseUrl.origin
    ).toString();
    return `Bearer resource_metadata="${metadata}", scope="${MONITOR_SCOPE}", error="${error}", error_description="${description}"`;
  }

  async authenticate(req: IncomingMessage): Promise<AuthInfo> {
    const header = req.headers.authorization ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(header);
    if (!match) throw new Error("Missing bearer token");
    const token = match[1];
    const { payload } = await jwtVerify(token, this.verificationKey, {
      issuer: this.issuer,
      audience: this.resource,
      algorithms: ["ES256"],
    });
    const scopes = typeof payload.scope === "string"
      ? payload.scope.split(/\s+/).filter(Boolean)
      : [];
    if (!scopes.includes(MONITOR_SCOPE)) throw new Error("Missing monitor scope");
    if (payload.sub !== "owner") throw new Error("Unknown subject");
    return {
      token,
      clientId: typeof payload.client_id === "string" ? payload.client_id : "unknown",
      scopes,
      expiresAt: payload.exp,
      resource: new URL(this.resource),
      extra: { subject: payload.sub },
    };
  }

  private cleanExpired(): void {
    const now = this.now();
    for (const [id, request] of this.authorizations) {
      if (request.expiresAt <= now) this.authorizations.delete(id);
    }
    for (const [code, value] of this.codes) {
      if (value.expiresAt <= now) this.codes.delete(code);
    }
  }

  private redirectAllowed(value: string): boolean {
    try {
      const url = new URL(value);
      if (!this.allowedRedirectOrigins.has(url.origin)) return false;
      if (url.origin === "https://chatgpt.com") {
        return (
          url.pathname === "/connector_platform_oauth_redirect" ||
          url.pathname.startsWith("/connector/oauth/")
        );
      }
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }

  private registerClient(payload: Record<string, unknown>): RegisteredClient {
    const redirectUris = Array.isArray(payload.redirect_uris)
      ? payload.redirect_uris.filter((value): value is string => typeof value === "string")
      : [];
    if (!redirectUris.length || !redirectUris.every((uri) => this.redirectAllowed(uri))) {
      throw new Error("Unapproved redirect URI");
    }
    if (
      payload.token_endpoint_auth_method !== undefined &&
      payload.token_endpoint_auth_method !== "none"
    ) {
      throw new Error("Only public PKCE clients are supported");
    }
    const clientId = `u1_${base64url(randomBytes(24))}`;
    const client: RegisteredClient = {
      clientId,
      redirectUris,
      clientName:
        typeof payload.client_name === "string" ? payload.client_name : "OpenAI plugin client",
      createdAt: new Date(this.now()).toISOString(),
    };
    this.state.clients[clientId] = client;
    this.persist();
    return client;
  }

  private validateAuthorization(url: URL): PendingAuthorization {
    if (!this.state.credential) throw new Error("Passkey enrollment required");
    if (url.searchParams.get("response_type") !== "code") {
      throw new Error("Unsupported response type");
    }
    const clientId = url.searchParams.get("client_id") ?? "";
    const client = this.state.clients[clientId];
    if (!client) throw new Error("Unknown OAuth client");
    const redirectUri = url.searchParams.get("redirect_uri") ?? "";
    if (!client.redirectUris.includes(redirectUri)) throw new Error("Redirect URI mismatch");
    const resource = url.searchParams.get("resource") ?? "";
    if (resource !== this.resource) throw new Error("Resource mismatch");
    const scope = url.searchParams.get("scope") ?? "";
    const requestedScopes = scope.split(/\s+/).filter(Boolean);
    if (!requestedScopes.length || requestedScopes.some((value) => value !== MONITOR_SCOPE)) {
      throw new Error("Unsupported scope");
    }
    const codeChallenge = url.searchParams.get("code_challenge") ?? "";
    if (
      url.searchParams.get("code_challenge_method") !== "S256" ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(codeChallenge)
    ) {
      throw new Error("S256 PKCE is required");
    }
    return {
      id: randomUUID(),
      clientId,
      redirectUri,
      state: url.searchParams.get("state") ?? "",
      scope: requestedScopes.join(" "),
      resource,
      codeChallenge,
      expiresAt: this.now() + AUTH_REQUEST_TTL_MS,
    };
  }

  private oauthPage(request: PendingAuthorization): string {
    const optionsPath = `${this.basePath}/oauth/authorize/options?request_id=${encodeURIComponent(request.id)}`;
    const verifyPath = `${this.basePath}/oauth/authorize/verify?request_id=${encodeURIComponent(request.id)}`;
    return page(
      "Connect U1 Print Studio",
      `<p>U1 PRINT STUDIO</p><h1>View your printer status</h1><p>Authenticate with your passkey to grant read-only access to telemetry and relayed camera frames.</p><button id="continue">Continue with Face ID</button><p id="message" role="status"></p>`,
      `${browserHelpers}
const button = document.getElementById("continue");
const message = document.getElementById("message");
button.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "Waiting for passkey…";
  try {
    const optionsResponse = await fetch(${JSON.stringify(optionsPath)}, { cache: "no-store" });
    if (!optionsResponse.ok) throw new Error(await optionsResponse.text());
    const options = await optionsResponse.json();
    const credential = await navigator.credentials.get({ publicKey: authenticationOptions(options) });
    const verification = await fetch(${JSON.stringify(verifyPath)}, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(authenticationResponse(credential)),
    });
    const result = await verification.json();
    if (!verification.ok) throw new Error(result.error || "Authentication failed");
    location.assign(result.redirectTo);
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Authentication failed";
    button.disabled = false;
  }
});`
    );
  }

  private enrollmentPage(token: string): string {
    const optionsPath = `${this.basePath}/auth/enroll/options?token=${encodeURIComponent(token)}`;
    const verifyPath = `${this.basePath}/auth/enroll/verify?token=${encodeURIComponent(token)}`;
    return page(
      "Enroll U1 passkey",
      `<p>U1 PRINT STUDIO</p><h1>Enroll this device</h1><p>Create the personal passkey used to connect the read-only iPhone status card. Keep this device available for recovery.</p><button id="enroll">Create passkey</button><p id="message" role="status"></p>`,
      `${browserHelpers}
const button = document.getElementById("enroll");
const message = document.getElementById("message");
button.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "Waiting for Face ID…";
  try {
    const optionsResponse = await fetch(${JSON.stringify(optionsPath)}, { cache: "no-store" });
    if (!optionsResponse.ok) throw new Error(await optionsResponse.text());
    const options = await optionsResponse.json();
    const credential = await navigator.credentials.create({ publicKey: registrationOptions(options) });
    const verification = await fetch(${JSON.stringify(verifyPath)}, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(registrationResponse(credential)),
    });
    const result = await verification.json();
    if (!verification.ok) throw new Error(result.error || "Enrollment failed");
    document.querySelector("main").innerHTML = "<h1>Passkey ready</h1><p>You can return to Codex and connect U1 Print Studio.</p>";
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Enrollment failed";
    button.disabled = false;
  }
});`
    );
  }

  private enrollmentTokenValid(value: string): boolean {
    return Boolean(
      !this.state.credential &&
      this.enrollmentToken &&
      value &&
      secureEqual(value, this.enrollmentToken)
    );
  }

  async handle(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
    this.cleanExpired();
    const localPath = url.pathname;
    const prefix = this.basePath;
    const externalPath = prefix && localPath.startsWith(prefix)
      ? localPath.slice(prefix.length) || "/"
      : localPath;

    if (
      req.method === "GET" &&
      (externalPath === "/.well-known/oauth-protected-resource" ||
        externalPath === "/.well-known/oauth-protected-resource/mcp")
    ) {
      writeJson(res, 200, this.protectedResourceMetadata());
      return true;
    }
    if (req.method === "GET" && externalPath === "/.well-known/oauth-authorization-server") {
      writeJson(res, 200, this.authorizationServerMetadata());
      return true;
    }
    if (req.method === "GET" && externalPath === "/.well-known/jwks.json") {
      writeJson(res, 200, { keys: [this.state.signingPublicJwk] });
      return true;
    }
    if (req.method === "POST" && externalPath === "/oauth/register") {
      try {
        const client = this.registerClient(await readJson<Record<string, unknown>>(req));
        writeJson(res, 201, {
          client_id: client.clientId,
          client_id_issued_at: Math.floor(this.now() / 1000),
          redirect_uris: client.redirectUris,
          token_endpoint_auth_method: "none",
          grant_types: ["authorization_code"],
          response_types: ["code"],
        });
      } catch (error) {
        writeJson(res, 400, {
          error: "invalid_client_metadata",
          error_description: error instanceof Error ? error.message : "Invalid registration",
        });
      }
      return true;
    }
    if (req.method === "GET" && externalPath === "/oauth/authorize") {
      try {
        const request = this.validateAuthorization(url);
        this.authorizations.set(request.id, request);
        writeHtml(res, 200, this.oauthPage(request));
      } catch (error) {
        writeHtml(
          res,
          400,
          page("Connection unavailable", `<h1>Cannot connect</h1><p>${html(error instanceof Error ? error.message : "Invalid authorization request")}</p>`)
        );
      }
      return true;
    }
    if (req.method === "GET" && externalPath === "/oauth/authorize/options") {
      const request = this.authorizations.get(url.searchParams.get("request_id") ?? "");
      const stored = this.state.credential;
      if (!request || request.expiresAt <= this.now() || !stored) {
        writeJson(res, 400, { error: "Authorization request expired" });
        return true;
      }
      const options = await generateAuthenticationOptions({
        rpID: this.rpId,
        allowCredentials: [{ id: stored.id, transports: stored.transports }],
        timeout: 60_000,
        userVerification: "required",
      });
      request.challenge = options.challenge;
      writeJson(res, 200, options);
      return true;
    }
    if (req.method === "POST" && externalPath === "/oauth/authorize/verify") {
      const requestId = url.searchParams.get("request_id") ?? "";
      const request = this.authorizations.get(requestId);
      const stored = this.state.credential;
      if (!request || !request.challenge || request.expiresAt <= this.now() || !stored) {
        writeJson(res, 400, { error: "Authorization request expired" });
        return true;
      }
      try {
        const response = await readJson<AuthenticationResponseJSON>(req);
        if (response.id !== stored.id) throw new Error("Unknown passkey");
        const verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge: request.challenge,
          expectedOrigin: this.expectedOrigin,
          expectedRPID: this.rpId,
          credential: credentialFromStored(stored),
          requireUserVerification: true,
        });
        if (!verification.verified || !verification.authenticationInfo.userVerified) {
          throw new Error("Passkey verification failed");
        }
        stored.counter = verification.authenticationInfo.newCounter;
        this.persist();
        this.authorizations.delete(requestId);
        const code = base64url(randomBytes(32));
        this.codes.set(code, {
          clientId: request.clientId,
          redirectUri: request.redirectUri,
          scope: request.scope,
          resource: request.resource,
          codeChallenge: request.codeChallenge,
          expiresAt: this.now() + AUTH_CODE_TTL_MS,
        });
        const redirect = new URL(request.redirectUri);
        redirect.searchParams.set("code", code);
        if (request.state) redirect.searchParams.set("state", request.state);
        redirect.searchParams.set("iss", this.issuer);
        writeJson(res, 200, { redirectTo: redirect.toString() });
      } catch (error) {
        writeJson(res, 400, {
          error: error instanceof Error ? error.message : "Authentication failed",
        });
      }
      return true;
    }
    if (req.method === "POST" && externalPath === "/oauth/token") {
      try {
        const form = await readForm(req);
        if (form.get("grant_type") !== "authorization_code") {
          throw new Error("Unsupported grant type");
        }
        const codeValue = form.get("code") ?? "";
        const code = this.codes.get(codeValue);
        if (!code || code.expiresAt <= this.now()) throw new Error("Invalid authorization code");
        if (
          form.get("client_id") !== code.clientId ||
          form.get("redirect_uri") !== code.redirectUri ||
          form.get("resource") !== code.resource
        ) {
          throw new Error("Authorization code binding mismatch");
        }
        const verifier = form.get("code_verifier") ?? "";
        if (!secureEqual(pkceChallenge(verifier), code.codeChallenge)) {
          throw new Error("PKCE verification failed");
        }
        this.codes.delete(codeValue);
        const issuedAt = Math.floor(this.now() / 1000);
        const accessToken = await new SignJWT({
          scope: code.scope,
          client_id: code.clientId,
        })
          .setProtectedHeader({
            alg: "ES256",
            kid: this.state.signingPublicJwk.kid,
            typ: "at+jwt",
          })
          .setIssuer(this.issuer)
          .setAudience(code.resource)
          .setSubject("owner")
          .setIssuedAt(issuedAt)
          .setExpirationTime(issuedAt + ACCESS_TOKEN_TTL_SECONDS)
          .setJti(randomUUID())
          .sign(this.signingKey);
        writeJson(res, 200, {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: ACCESS_TOKEN_TTL_SECONDS,
          scope: code.scope,
        });
      } catch (error) {
        writeJson(res, 400, {
          error: "invalid_grant",
          error_description: error instanceof Error ? error.message : "Token exchange failed",
        });
      }
      return true;
    }
    if (req.method === "GET" && externalPath === "/auth/enroll") {
      const token = url.searchParams.get("token") ?? "";
      if (!this.enrollmentTokenValid(token)) {
        writeHtml(res, 404, page("Enrollment unavailable", "<h1>Enrollment unavailable</h1><p>This link is invalid or has already been used.</p>"));
      } else {
        writeHtml(res, 200, this.enrollmentPage(token));
      }
      return true;
    }
    if (req.method === "GET" && externalPath === "/auth/enroll/options") {
      const token = url.searchParams.get("token") ?? "";
      if (!this.enrollmentTokenValid(token)) {
        writeJson(res, 404, { error: "Enrollment unavailable" });
        return true;
      }
      const options = await generateRegistrationOptions({
        rpName: "U1 Print Studio",
        rpID: this.rpId,
        userName: this.ownerName,
        userDisplayName: this.ownerName,
        userID: Uint8Array.from(sha256(`${this.issuer}:owner`)),
        timeout: 60_000,
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },
        preferredAuthenticatorType: "localDevice",
      });
      this.enrollmentChallenge = options.challenge;
      writeJson(res, 200, options);
      return true;
    }
    if (req.method === "POST" && externalPath === "/auth/enroll/verify") {
      const token = url.searchParams.get("token") ?? "";
      if (!this.enrollmentTokenValid(token) || !this.enrollmentChallenge) {
        writeJson(res, 404, { error: "Enrollment unavailable" });
        return true;
      }
      try {
        const response = await readJson<RegistrationResponseJSON>(req);
        const verification = await verifyRegistrationResponse({
          response,
          expectedChallenge: this.enrollmentChallenge,
          expectedOrigin: this.expectedOrigin,
          expectedRPID: this.rpId,
          requireUserVerification: true,
        });
        if (!verification.verified || !verification.registrationInfo.userVerified) {
          throw new Error("Passkey enrollment failed");
        }
        const credential = verification.registrationInfo.credential;
        this.state.credential = {
          id: credential.id,
          publicKey: Buffer.from(credential.publicKey).toString("base64url"),
          counter: credential.counter,
          transports: credential.transports,
        };
        this.enrollmentChallenge = null;
        this.persist();
        rmSync(this.enrollmentLinkPath, { force: true });
        writeJson(res, 200, { enrolled: true });
      } catch (error) {
        writeJson(res, 400, {
          error: error instanceof Error ? error.message : "Enrollment failed",
        });
      }
      return true;
    }
    return false;
  }
}

export async function createPersonalOAuthFromEnvironment(): Promise<PersonalOAuthService | null> {
  if (process.env.U1_REMOTE_AUTH !== "personal") return null;
  const publicBaseUrl = process.env.U1_PUBLIC_BASE_URL?.trim();
  if (!publicBaseUrl) throw new Error("U1_PUBLIC_BASE_URL is required for personal remote auth");
  return await PersonalOAuthService.create({
    publicBaseUrl,
    stateDirectory: process.env.U1_AUTH_STATE_DIR?.trim() || undefined,
    ownerName: process.env.U1_OWNER_NAME?.trim() || undefined,
    enrollmentToken: process.env.U1_ENROLLMENT_TOKEN?.trim() || undefined,
    allowedRedirectOrigins: process.env.U1_OAUTH_REDIRECT_ORIGINS
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  });
}
