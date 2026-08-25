import { afterEach, describe, expect, test } from "bun:test";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { importJWK, SignJWT, type JWK } from "jose";

import { PersonalOAuthService, pkceChallenge } from "./personal-oauth.js";
import { createRequestHandler } from "./server.js";

const cleanups: Array<() => Promise<void> | void> = [];

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

async function fixture() {
  const stateDirectory = mkdtempSync(path.join(tmpdir(), "u1-oauth-test-"));
  cleanups.push(() => rmSync(stateDirectory, { recursive: true, force: true }));
  const oauth = await PersonalOAuthService.create({
    publicBaseUrl: "https://status.example/u1",
    stateDirectory,
    enrollmentToken: "fixture-enrollment-token",
  });
  const server = createServer(createRequestHandler(oauth));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  cleanups.push(() => close(server));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test address");
  return {
    oauth,
    stateDirectory,
    localBaseUrl: `http://127.0.0.1:${address.port}/u1`,
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

describe("personal OAuth discovery and boundary", () => {
  test("derives the RFC 7636 S256 PKCE challenge", () => {
    expect(pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
    );
  });

  test("keeps root-hosted endpoints on the configured origin", async () => {
    const stateDirectory = mkdtempSync(path.join(tmpdir(), "u1-oauth-root-test-"));
    cleanups.push(() => rmSync(stateDirectory, { recursive: true, force: true }));
    const oauth = await PersonalOAuthService.create({
      publicBaseUrl: "https://status.example:8443",
      stateDirectory,
      enrollmentToken: "fixture-enrollment-token",
    });

    expect(oauth.issuer).toBe("https://status.example:8443/");
    expect(oauth.resource).toBe("https://status.example:8443/mcp");
    expect(oauth.authorizationServerMetadata()).toMatchObject({
      authorization_endpoint: "https://status.example:8443/oauth/authorize",
      token_endpoint: "https://status.example:8443/oauth/token",
      registration_endpoint: "https://status.example:8443/oauth/register",
    });
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
      grant_types: ["authorization_code"],
      response_types: ["code"],
    });
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
        serverInfo: { name: "u1-print-studio", version: "0.2.0" },
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
      "show_u1_status",
      "get_u1_status",
      "get_u1_camera_frame",
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
