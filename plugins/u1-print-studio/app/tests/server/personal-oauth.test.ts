import { afterEach, describe, expect, test } from "bun:test";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { importJWK, SignJWT, type JWK } from "jose";

import { createCameraRuntime } from "../../src/lib/server/camera-runtime.js";
import { PersonalOAuthService, pkceChallenge } from "../../src/lib/server/personal-oauth.js";
import {
  createEnrollmentRequestHandler,
  createRequestHandler,
  enrollmentPortFromEnvironment,
} from "../../src/entrypoints/server.js";

const cleanups: Array<() => Promise<void> | void> = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

async function serve(oauth: PersonalOAuthService) {
  const camera = createCameraRuntime({
    signaling: {
      requestOffer: async () => ({
        type: "offer",
        id: "private-peer",
        sdp: "v=0\r\nfixture-offer\r\n",
        iceServers: [],
      }),
      sendAnswer: async () => {},
      sendCandidates: async () => {},
    },
  });
  const server = createServer(createRequestHandler(oauth, {
    ...camera,
    locator: { locate: (token) => `https://status.example/media?ticket=${token}` },
  }));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  cleanups.push(() => close(server));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test address");
  return `http://127.0.0.1:${address.port}${oauth.basePath}`;
}

async function serveEnrollment(oauth: PersonalOAuthService) {
  const server = createServer(createEnrollmentRequestHandler(oauth));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  cleanups.push(() => close(server));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test address");
  return `http://127.0.0.1:${address.port}`;
}

async function fixture(config: { now?: () => number } = {}) {
  const stateDirectory = mkdtempSync(path.join(tmpdir(), "u1-oauth-test-"));
  cleanups.push(() => rmSync(stateDirectory, { recursive: true, force: true }));
  const oauth = await PersonalOAuthService.create({
    publicBaseUrl: "https://status.example/u1",
    enrollmentBaseUrl: "https://status.example:8445",
    stateDirectory,
    enrollmentToken: "fixture-enrollment-token",
    now: config.now,
  });
  return {
    oauth,
    stateDirectory,
    localBaseUrl: await serve(oauth),
    localEnrollmentBaseUrl: await serveEnrollment(oauth),
  };
}

async function close(server: Server): Promise<void> {
  server.closeAllConnections();
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

async function mintMonitorToken(args: {
  stateDirectory: string;
  issuer: string;
  resource: string;
  clientId?: string;
  audience?: string;
  scope?: string;
  subject?: string;
}): Promise<string> {
  const state = JSON.parse(
    readFileSync(path.join(args.stateDirectory, "personal-oauth.json"), "utf8")
  ) as { signingPrivateJwk: JWK; signingPublicJwk: JWK };
  const key = await importJWK(state.signingPrivateJwk, "ES256");
  const issuedAt = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    scope: args.scope ?? "u1.monitor",
    client_id: args.clientId ?? "fixture-client",
  })
    .setProtectedHeader({
      alg: "ES256",
      kid: state.signingPublicJwk.kid,
      typ: "at+jwt",
    })
    .setIssuer(args.issuer)
    .setAudience(args.audience ?? args.resource)
    .setSubject(args.subject ?? "owner")
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + 300)
    .sign(key);
}

async function mcpPost(url: string, token: string | null, body: unknown) {
  return await fetch(`${url}/mcp`, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      "mcp-protocol-version": "2025-06-18",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function registerClient(localBaseUrl: string): Promise<string> {
  const response = await fetch(`${localBaseUrl}/oauth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_name: "ChatGPT",
      redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
      token_endpoint_auth_method: "none",
    }),
  });
  expect(response.status).toBe(201);
  return ((await response.json()) as { client_id: string }).client_id;
}

function seedAuthorizationCode(
  oauth: PersonalOAuthService,
  args: { code: string; clientId: string; verifier: string; now?: number }
): void {
  const codes = (oauth as unknown as {
    codes: Map<string, {
      clientId: string;
      redirectUri: string;
      scope: string;
      resource: string;
      codeChallenge: string;
      expiresAt: number;
    }>;
  }).codes;
  codes.set(args.code, {
    clientId: args.clientId,
    redirectUri: "https://chatgpt.com/connector_platform_oauth_redirect",
    scope: "u1.monitor",
    resource: oauth.resource,
    codeChallenge: pkceChallenge(args.verifier),
    expiresAt: (args.now ?? Date.now()) + 60_000,
  });
}

async function exchangeCode(args: {
  localBaseUrl: string;
  oauth: PersonalOAuthService;
  code: string;
  clientId: string;
  verifier: string;
}) {
  return await fetch(`${args.localBaseUrl}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: args.code,
      client_id: args.clientId,
      redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
      resource: args.oauth.resource,
      code_verifier: args.verifier,
    }),
  });
}

async function refresh(args: {
  localBaseUrl: string;
  oauth: PersonalOAuthService;
  refreshToken: string;
  clientId: string;
  resource?: string;
  scope?: string;
}) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: args.refreshToken,
    client_id: args.clientId,
    resource: args.resource ?? args.oauth.resource,
  });
  if (args.scope !== undefined) body.set("scope", args.scope);
  return await fetch(`${args.localBaseUrl}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
}

describe("personal OAuth discovery and boundary", () => {
  test("derives the RFC 7636 S256 PKCE challenge", () => {
    expect(pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
    );
  });

  test("keeps root-hosted endpoints on standard HTTPS", async () => {
    const stateDirectory = mkdtempSync(path.join(tmpdir(), "u1-oauth-root-test-"));
    cleanups.push(() => rmSync(stateDirectory, { recursive: true, force: true }));
    const oauth = await PersonalOAuthService.create({
      publicBaseUrl: "https://status.example",
      enrollmentBaseUrl: "https://status.example:8445",
      stateDirectory,
      enrollmentToken: "fixture-enrollment-token",
    });

    expect(oauth.issuer).toBe("https://status.example/");
    expect(oauth.resource).toBe("https://status.example/mcp");
    expect(oauth.enrollmentUrl).toBe(
      "https://status.example:8445/auth/enroll?token=fixture-enrollment-token"
    );
    expect(oauth.authorizationServerMetadata()).toMatchObject({
      authorization_endpoint: "https://status.example/oauth/authorize",
      token_endpoint: "https://status.example/oauth/token",
      registration_endpoint: "https://status.example/oauth/register",
    });
    const nonstandardDirectory = mkdtempSync(
      path.join(tmpdir(), "u1-oauth-port-test-")
    );
    cleanups.push(() =>
      rmSync(nonstandardDirectory, { recursive: true, force: true })
    );
    await expect(PersonalOAuthService.create({
      publicBaseUrl: "https://status.example:8443",
      enrollmentBaseUrl: "https://status.example:8445",
      stateDirectory: nonstandardDirectory,
    })).rejects.toThrow("standard HTTPS port 443");
  });

  test("rejects public enrollment and exposes only enrollment on the private listener", async () => {
    const { oauth, localBaseUrl, localEnrollmentBaseUrl } = await fixture();
    for (const path of [
      "/auth/enroll?token=fixture-enrollment-token",
      "/auth/enroll/options?token=fixture-enrollment-token",
      "/auth/enroll/verify?token=fixture-enrollment-token",
    ]) {
      const publicResponse = await fetch(`${localBaseUrl}${path}`, {
        method: path.includes("verify") ? "POST" : "GET",
      });
      expect(publicResponse.status).toBe(404);
    }

    const privateEnrollment = await fetch(
      `${localEnrollmentBaseUrl}/auth/enroll?token=fixture-enrollment-token`
    );
    expect(privateEnrollment.status).toBe(200);
    expect(await privateEnrollment.text()).toContain("Create passkey");
    expect((await fetch(`${localEnrollmentBaseUrl}/health`)).status).toBe(200);
    for (const path of ["/mcp", "/oauth/token", "/media/camera.webrtc", "/widget"]) {
      expect((await fetch(`${localEnrollmentBaseUrl}${path}`)).status).toBe(404);
    }
    expect(oauth.rpId).toBe("status.example");
    expect(oauth.expectedOrigin).toBe("https://status.example");
    expect(oauth.enrollmentExpectedOrigin).toBe("https://status.example:8445");
  });

  test("requires enrollment HTTPS to share the RP ID but use a distinct origin", async () => {
    const stateDirectory = mkdtempSync(path.join(tmpdir(), "u1-oauth-origin-test-"));
    cleanups.push(() => rmSync(stateDirectory, { recursive: true, force: true }));
    await expect(PersonalOAuthService.create({
      publicBaseUrl: "https://status.example",
      enrollmentBaseUrl: "https://attacker.example:8445",
      stateDirectory,
    })).rejects.toThrow("same hostname");
    await expect(PersonalOAuthService.create({
      publicBaseUrl: "https://status.example",
      enrollmentBaseUrl: "https://status.example",
      stateDirectory,
    })).rejects.toThrow("distinct nonstandard HTTPS origin");
  });

  test("requires a distinct loopback port for a configured enrollment origin", () => {
    expect(() => enrollmentPortFromEnvironment(8787, {})).toThrow(
      "U1_ENROLLMENT_PORT"
    );
    expect(() => enrollmentPortFromEnvironment(8787, {
      U1_ENROLLMENT_PORT: "8787",
    })).toThrow("distinct loopback port");
    expect(enrollmentPortFromEnvironment(8787, {
      U1_ENROLLMENT_PORT: "8789",
    })).toBe(8789);
  });

  test("keeps private health available while enrolled routes reject after restart", async () => {
    const { stateDirectory } = await fixture();
    const statePath = path.join(stateDirectory, "personal-oauth.json");
    const state = JSON.parse(readFileSync(statePath, "utf8")) as Record<string, unknown>;
    state.credential = {
      id: "stored-credential-id",
      publicKey: "AA",
      counter: 0,
    };
    writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    const restarted = await PersonalOAuthService.create({
      publicBaseUrl: "https://status.example/u1",
      enrollmentBaseUrl: "https://status.example:8445",
      stateDirectory,
    });
    expect(restarted.enrollmentUrl).toBeNull();
    expect(restarted.enrollmentBaseUrl?.origin).toBe("https://status.example:8445");
    const privateOrigin = await serveEnrollment(restarted);
    expect((await fetch(`${privateOrigin}/health`)).status).toBe(200);
    expect((await fetch(`${privateOrigin}/auth/enroll?token=anything`)).status).toBe(404);
  });

  test("publishes path-aware OAuth and protected-resource metadata", async () => {
    const { oauth, localBaseUrl } = await fixture();

    const protectedResponse = await fetch(
      `${localBaseUrl}/.well-known/oauth-protected-resource`
    );
    expect(protectedResponse.status).toBe(200);
    expect(await protectedResponse.json()).toEqual({
      resource: "https://status.example/u1/mcp",
      authorization_servers: ["https://status.example/u1"],
      scopes_supported: ["u1.monitor"],
    });

    const metadataResponse = await fetch(
      `${localBaseUrl}/.well-known/oauth-authorization-server`
    );
    expect(metadataResponse.status).toBe(200);
    expect(await metadataResponse.json()).toMatchObject({
      issuer: oauth.issuer,
      authorization_endpoint: "https://status.example/u1/oauth/authorize",
      token_endpoint: "https://status.example/u1/oauth/token",
      registration_endpoint: "https://status.example/u1/oauth/register",
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      authorization_response_iss_parameter_supported: true,
    });
  });

  test("allows only approved ChatGPT callback shapes during DCR", async () => {
    const { localBaseUrl } = await fixture();
    const rejected = await fetch(`${localBaseUrl}/oauth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        redirect_uris: ["https://attacker.example/callback"],
        token_endpoint_auth_method: "none",
      }),
    });
    expect(rejected.status).toBe(400);

    const accepted = await fetch(`${localBaseUrl}/oauth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_name: "ChatGPT",
        redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
        token_endpoint_auth_method: "none",
      }),
    });
    expect(accepted.status).toBe(201);
    expect(await accepted.json()).toMatchObject({
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    });
  });

  test("migrates version 1 state without replacing keys or clients", async () => {
    const { stateDirectory, localBaseUrl } = await fixture();
    const clientId = await registerClient(localBaseUrl);
    const statePath = path.join(stateDirectory, "personal-oauth.json");
    const current = JSON.parse(readFileSync(statePath, "utf8")) as Record<string, unknown>;
    const signingKid = (current.signingPublicJwk as JWK).kid;
    current.version = 1;
    delete current.refreshTokens;
    writeFileSync(statePath, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });

    await PersonalOAuthService.create({
      publicBaseUrl: "https://status.example/u1",
      enrollmentBaseUrl: "https://status.example:8445",
      stateDirectory,
      enrollmentToken: "fixture-enrollment-token",
    });

    const migrated = JSON.parse(readFileSync(statePath, "utf8")) as {
      version: number;
      signingPublicJwk: JWK;
      clients: Record<string, unknown>;
      refreshTokens: Record<string, unknown>;
    };
    expect(migrated.version).toBe(2);
    expect(migrated.signingPublicJwk.kid).toBe(signingKid);
    expect(migrated.clients[clientId]).toBeDefined();
    expect(migrated.refreshTokens).toEqual({});
  });

  test("issues, persists, binds, and rotates refresh tokens without storing plaintext", async () => {
    const { oauth, stateDirectory, localBaseUrl } = await fixture();
    const clientId = await registerClient(localBaseUrl);
    const verifier = "refresh-token-fixture-verifier-with-43-characters";
    const code = "fixture-authorization-code";
    seedAuthorizationCode(oauth, { code, clientId, verifier });

    const initialResponse = await exchangeCode({
      localBaseUrl,
      oauth,
      code,
      clientId,
      verifier,
    });
    expect(initialResponse.status).toBe(200);
    const initial = (await initialResponse.json()) as {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
    };
    expect(initial.refresh_token).toStartWith("u1r_");
    expect(initial.expires_in).toBe(15 * 60);
    expect(initial.scope).toBe("u1.monitor");

    const codeReplay = await exchangeCode({
      localBaseUrl,
      oauth,
      code,
      clientId,
      verifier,
    });
    expect(codeReplay.status).toBe(400);

    const statePath = path.join(stateDirectory, "personal-oauth.json");
    const persisted = readFileSync(statePath, "utf8");
    expect(persisted).not.toContain(initial.refresh_token);
    expect(Object.keys((JSON.parse(persisted) as { refreshTokens: object }).refreshTokens)).toHaveLength(1);
    expect(statSync(statePath).mode & 0o777).toBe(0o600);

    const restarted = await PersonalOAuthService.create({
      publicBaseUrl: "https://status.example/u1",
      enrollmentBaseUrl: "https://status.example:8445",
      stateDirectory,
      enrollmentToken: "fixture-enrollment-token",
    });
    const restartedBaseUrl = await serve(restarted);

    expect((await refresh({
      localBaseUrl: restartedBaseUrl,
      oauth: restarted,
      refreshToken: initial.refresh_token,
      clientId: "wrong-client",
    })).status).toBe(400);
    expect((await refresh({
      localBaseUrl: restartedBaseUrl,
      oauth: restarted,
      refreshToken: initial.refresh_token,
      clientId,
      resource: "https://status.example/other",
    })).status).toBe(400);
    expect((await refresh({
      localBaseUrl: restartedBaseUrl,
      oauth: restarted,
      refreshToken: initial.refresh_token,
      clientId,
      scope: "u1.control",
    })).status).toBe(400);

    const rotatedResponse = await refresh({
      localBaseUrl: restartedBaseUrl,
      oauth: restarted,
      refreshToken: initial.refresh_token,
      clientId,
    });
    expect(rotatedResponse.status).toBe(200);
    const rotated = (await rotatedResponse.json()) as {
      access_token: string;
      refresh_token: string;
      scope: string;
    };
    expect(rotated.refresh_token).not.toBe(initial.refresh_token);
    expect(rotated.scope).toBe("u1.monitor");

    const replay = await refresh({
      localBaseUrl: restartedBaseUrl,
      oauth: restarted,
      refreshToken: initial.refresh_token,
      clientId,
    });
    expect(replay.status).toBe(400);
    expect(await replay.json()).toMatchObject({ error: "invalid_grant" });

    const initialize = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "refresh-test", version: "1.0.0" },
      },
    };
    expect((await mcpPost(restartedBaseUrl, rotated.access_token, initialize)).status).toBe(200);

    const concurrent = await Promise.all([
      refresh({
        localBaseUrl: restartedBaseUrl,
        oauth: restarted,
        refreshToken: rotated.refresh_token,
        clientId,
      }),
      refresh({
        localBaseUrl: restartedBaseUrl,
        oauth: restarted,
        refreshToken: rotated.refresh_token,
        clientId,
      }),
    ]);
    expect(concurrent.map((response) => response.status).sort()).toEqual([200, 400]);
    const concurrentSuccess = concurrent.find((response) => response.status === 200);
    expect(concurrentSuccess).toBeDefined();
    const concurrentToken = ((await concurrentSuccess!.json()) as {
      refresh_token: string;
    }).refresh_token;

    const rotatedState = readFileSync(statePath, "utf8");
    expect(rotatedState).not.toContain(initial.refresh_token);
    expect(rotatedState).not.toContain(rotated.refresh_token);
    expect(rotatedState).not.toContain(concurrentToken);
    expect(Object.keys((JSON.parse(rotatedState) as { refreshTokens: object }).refreshTokens)).toHaveLength(1);
  });

  test("expires persisted refresh tokens", async () => {
    let now = Date.parse("2026-08-25T20:00:00Z");
    const { oauth, stateDirectory, localBaseUrl } = await fixture({ now: () => now });
    const clientId = await registerClient(localBaseUrl);
    const verifier = "expiring-refresh-token-verifier-with-43-characters";
    const code = "expiring-authorization-code";
    seedAuthorizationCode(oauth, { code, clientId, verifier, now });
    const issuedResponse = await exchangeCode({
      localBaseUrl,
      oauth,
      code,
      clientId,
      verifier,
    });
    const issued = (await issuedResponse.json()) as { refresh_token: string };
    now += 31 * 24 * 60 * 60_000;

    const expired = await refresh({
      localBaseUrl,
      oauth,
      refreshToken: issued.refresh_token,
      clientId,
    });
    expect(expired.status).toBe(400);
    const state = JSON.parse(
      readFileSync(path.join(stateDirectory, "personal-oauth.json"), "utf8")
    ) as { refreshTokens: Record<string, unknown> };
    expect(state.refreshTokens).toEqual({});
  });

  test("challenges unauthenticated MCP and accepts an audience-bound monitor token", async () => {
    const { oauth, stateDirectory, localBaseUrl } = await fixture();
    const initialize = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "oauth-test", version: "1.0.0" },
      },
    };

    const denied = await mcpPost(localBaseUrl, null, initialize);
    expect(denied.status).toBe(401);
    expect(denied.headers.get("www-authenticate")).toContain(
      "/u1/.well-known/oauth-protected-resource"
    );

    const token = await mintMonitorToken({
      stateDirectory,
      issuer: oauth.issuer,
      resource: oauth.resource,
    });
    const allowed = await mcpPost(localBaseUrl, token, initialize);
    expect(allowed.status).toBe(200);
    expect(await allowed.json()).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        serverInfo: { name: "u1-print-studio", version: "0.4.12" },
      },
    });

    const tools = await mcpPost(localBaseUrl, token, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });
    expect(tools.status).toBe(200);
    const toolsBody = (await tools.json()) as {
      result: { tools: Array<{ name: string; securitySchemes?: unknown }> };
    };
    expect(toolsBody.result.tools.map((tool) => tool.name)).toEqual([
      "observe_printer",
      "refresh_printer_observation",
      "get_u1_camera_frame",
      "open_printer_camera",
      "open_u1_camera_stream",
      "answer_u1_camera_stream",
      "add_u1_camera_ice_candidates",
      "close_u1_camera_stream",
    ]);
    const modelVisible = toolsBody.result.tools.filter((tool) => {
      const visibility = (tool as { _meta?: { ui?: { visibility?: string[] } } })
        ._meta?.ui?.visibility;
      return !visibility || visibility.includes("model");
    });
    expect(modelVisible.map((tool) => tool.name)).toEqual([
      "observe_printer",
      "open_printer_camera",
    ]);
    expect(toolsBody.result.tools[0]?.securitySchemes).toEqual([
      { type: "oauth2", scopes: ["u1.monitor"] },
    ]);

    const wrongAudience = await mintMonitorToken({
      stateDirectory,
      issuer: oauth.issuer,
      resource: oauth.resource,
      audience: "https://status.example/other",
    });
    expect((await mcpPost(localBaseUrl, wrongAudience, initialize)).status).toBe(401);

    const wrongScope = await mintMonitorToken({
      stateDirectory,
      issuer: oauth.issuer,
      resource: oauth.resource,
      scope: "u1.control",
    });
    expect((await mcpPost(localBaseUrl, wrongScope, initialize)).status).toBe(401);
  });
});
