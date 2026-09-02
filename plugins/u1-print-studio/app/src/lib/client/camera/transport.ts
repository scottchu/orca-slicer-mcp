import type { CameraCandidate, CameraFrameResult, CameraOffer, CameraTransport } from './session.js';

/** Supplied by the shared HostRpc. Camera owns no message listener or URL. */
export type CameraRpcPort = { callTool: (name: string, argumentsValue: Record<string, unknown>) => Promise<unknown> };
const invalid = (): never => { throw new Error('Invalid Camera response'); };
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : invalid();
const byteLength = (value: string): number => new TextEncoder().encode(value).length;
const text = (value: unknown, minimum: number, maximum: number): string => typeof value === 'string' && value.length >= minimum && byteLength(value) <= maximum ? value : invalid();
const token = (value: unknown): string => text(value, 16, 512);
const envelope = (value: unknown) => {
  const root = object(value);
  if (root.isError === true) invalid();
  return { content: object(root.structuredContent), meta: object(root._meta ?? root.meta ?? {}) };
};
// The dashboard tools endpoint returns these acknowledgements directly; MCP
// wraps the same payload in structuredContent. Frame/offer metadata stays strict.
const acknowledgement = (value: unknown) => {
  const root = object(value);
  if (root.isError === true) invalid();
  return object(root.structuredContent === undefined ? root : root.structuredContent);
};
const timestamp = (value: unknown): string => {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)) return invalid();
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString() === value ? value : invalid();
};
const optionalField = (value: unknown): string | undefined => value === undefined ? undefined : text(value, 0, 1024);

export const parseCameraFrame = (value: unknown): CameraFrameResult => {
  const { content, meta } = envelope(value);
  if (content.schemaVersion !== 1 || typeof content.available !== 'boolean') invalid();
  const observedAt = timestamp(content.observedAt);
  let snapshot: CameraFrameResult['snapshot'] = null;
  if (content.available) {
    if (content.mediaType !== 'image/jpeg' || !Number.isSafeInteger(content.byteLength) || Number(content.byteLength) < 1 || Number(content.byteLength) > 4 * 1024 * 1024) invalid();
    const image = text(object(meta.cameraFrame).dataUrl, 1, 23 + Math.ceil(4 * 1024 * 1024 / 3) * 4);
    const prefix = 'data:image/jpeg;base64,';
    if (!image.startsWith(prefix)) invalid();
    const payload = image.slice(prefix.length);
    const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
    const body = payload.slice(0, payload.length - padding);
    // A flat character scan stays bounded even at the 4 MiB frame ceiling.
    if (!body || payload.length % 4 !== 0 || /[^A-Za-z0-9+/]/.test(body)) invalid();
    const final = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(body.at(-1)!);
    if ((padding === 2 && final % 16 !== 0) || (padding === 1 && final % 4 !== 0)) invalid();
    const decodedBytes = payload.length / 4 * 3 - padding;
    if (decodedBytes !== content.byteLength) invalid();
    snapshot = Object.freeze({ image, observedAt });
  } else if (content.mediaType !== null || content.byteLength !== 0) invalid();
  const activation = meta.cameraActivation === undefined ? null : object(meta.cameraActivation);
  return Object.freeze({ snapshot, ...(activation ? { activationToken: token(activation.token) } : {}) });
};

const iceServers = (value: unknown): RTCIceServer[] => {
  if (!Array.isArray(value) || value.length > 4) return invalid();
  return value.map((item) => {
    const server = object(item);
    const urls = typeof server.urls === 'string' ? [server.urls] : server.urls;
    if (!Array.isArray(urls) || !urls.length || urls.length > 4) return invalid();
    const parsed = urls.map((value) => {
      const url = text(value, 1, 1024);
      return /^(stun|stuns|turn|turns):/i.test(url) ? url : invalid();
    });
    const username = optionalField(server.username), credential = optionalField(server.credential);
    return { urls: typeof server.urls === 'string' ? parsed[0] : parsed, ...(username === undefined ? {} : { username }), ...(credential === undefined ? {} : { credential }) };
  });
};
export const parseCameraOffer = (value: unknown): CameraOffer => {
  const { content, meta } = envelope(value);
  const stream = object(meta.cameraStream), offer = object(stream.offer);
  if (content.schemaVersion !== 2 || content.available !== true || stream.transport !== 'mcp-apps-tools' || offer.type !== 'offer') invalid();
  return Object.freeze({ sessionId: token(stream.sessionId), sdp: text(offer.sdp, 1, 96 * 1024), iceServers: iceServers(stream.iceServers) });
};
const candidate = (value: CameraCandidate): CameraCandidate => {
  if (value.sdpMLineIndex !== null && (!Number.isSafeInteger(value.sdpMLineIndex) || value.sdpMLineIndex < 0)) invalid();
  return {
    candidate: text(value.candidate, 1, 8 * 1024),
    sdpMid: value.sdpMid === null ? null : text(value.sdpMid, 0, 1024),
    sdpMLineIndex: value.sdpMLineIndex,
    ...(value.usernameFragment === undefined ? {} : { usernameFragment: value.usernameFragment === null ? null : text(value.usernameFragment, 0, 1024) })
  };
};
export const cameraTransport = (rpc: CameraRpcPort): CameraTransport => {
  const close = async (sessionId: string): Promise<void> => {
    const content = acknowledgement(await rpc.callTool('close_u1_camera_stream', { sessionId: token(sessionId) }));
    if (typeof content.closed !== 'boolean') invalid();
  };
  return {
    frame: async ({ authorizeLive }) => parseCameraFrame(await rpc.callTool('get_u1_camera_frame', authorizeLive ? { authorizeLive: true } : {})),
    open: async (activationToken) => {
      const result = await rpc.callTool('open_u1_camera_stream', { activationToken: token(activationToken) });
      try { return parseCameraOffer(result); }
      catch {
        // A malformed allocated offer still owns a lease; release only its
        // returned bounded opaque id, without publishing metadata or errors.
        try {
          const root = object(result), meta = object(root._meta ?? root.meta);
          const id = token(object(meta.cameraStream).sessionId);
          void close(id).catch(() => {});
        } catch { /* No usable returned session capability. */ }
        throw new Error('Camera offer unavailable');
      }
    },
    answer: async (sessionId, sdp) => {
      const content = acknowledgement(await rpc.callTool('answer_u1_camera_stream', { sessionId: token(sessionId), sdp: text(sdp, 1, 96 * 1024) }));
      if (content.accepted !== true) invalid();
    },
    candidates: async (sessionId, values) => {
      if (!values.length || values.length > 16) invalid();
      const content = acknowledgement(await rpc.callTool('add_u1_camera_ice_candidates', { sessionId: token(sessionId), candidates: values.map(candidate) }));
      if (content.accepted !== true || !Number.isSafeInteger(content.candidateCount) || Number(content.candidateCount) < 0 || Number(content.candidateCount) > values.length) invalid();
    },
    close,
  };
};
