import { describe, expect, it, vi } from 'vitest';
import { cameraTransport, parseCameraFrame, parseCameraOffer } from './transport';

const id = 'fixture-session-capability';
const activation = 'fixture-activation-capability';
const observedAt = '2026-09-01T12:00:00.000Z';
const frame = () => ({ structuredContent: { schemaVersion: 1, available: true, observedAt, mediaType: 'image/jpeg', byteLength: 4 }, _meta: { cameraFrame: { dataUrl: 'data:image/jpeg;base64,/9j/2Q==' }, cameraActivation: { token: activation } } });
const offer = () => ({ structuredContent: { schemaVersion: 2, available: true }, _meta: { cameraStream: { transport: 'mcp-apps-tools', sessionId: id, offer: { type: 'offer', sdp: 'fixture-offer' }, iceServers: [{ urls: ['stun:relay.invalid', 'turns:relay.invalid'], username: 'fixture-user', credential: 'fixture-secret' }] } } });
const ack = (content: Record<string, unknown>) => ({ structuredContent: content });

describe('closed Camera transport and private response parsing', () => {
  it('preserves exact decoded-image source time and optional activation', () => {
    expect(parseCameraFrame(frame())).toEqual({ snapshot: { image: frame()._meta.cameraFrame.dataUrl, observedAt }, activationToken: activation });
    const value = frame();
    expect(parseCameraFrame({ structuredContent: value.structuredContent, meta: value._meta })).toEqual(parseCameraFrame(value));
    expect(parseCameraFrame({ structuredContent: { schemaVersion: 1, available: false, observedAt, mediaType: null, byteLength: 0 }, _meta: { cameraActivation: { token: activation } } })).toEqual({ snapshot: null, activationToken: activation });
  });
  it('rejects absent/mismatched receipts, non-JPEG URLs and invalid base64 without exposing input', () => {
    for (const mutate of [
      (value: ReturnType<typeof frame>) => { value.structuredContent.byteLength = 0; },
      (value: ReturnType<typeof frame>) => { value.structuredContent.byteLength = 3; },
      (value: ReturnType<typeof frame>) => { value.structuredContent.observedAt = '2026-02-31T12:00:00.000Z'; },
      (value: ReturnType<typeof frame>) => { value.structuredContent.observedAt = '2026-09-01T12:00:00Z'; },
      (value: ReturnType<typeof frame>) => { value._meta.cameraFrame.dataUrl = 'https://private.invalid/camera'; },
      (value: ReturnType<typeof frame>) => { value._meta.cameraFrame.dataUrl = 'data:image/jpeg;base64,/9j/2Q='; },
      (value: ReturnType<typeof frame>) => { value._meta.cameraFrame.dataUrl = 'data:image/jpeg;base64,/9j/ 2Q=='; },
      (value: ReturnType<typeof frame>) => { value._meta.cameraActivation.token = 'short'; },
    ]) {
      const value = frame(); mutate(value);
      expect(() => parseCameraFrame(value)).toThrow('Invalid Camera response');
    }
    expect(() => parseCameraFrame({ ...frame(), isError: true })).toThrow();
    expect(() => parseCameraFrame({ structuredContent: frame().structuredContent })).toThrow();
  });
  it('admits the acquisition byte ceiling without a regular-expression stack failure', () => {
    const value = frame();
    value.structuredContent.byteLength = 4 * 1024 * 1024;
    value._meta.cameraFrame.dataUrl = `data:image/jpeg;base64,${'A'.repeat(5592406)}==`;
    expect(parseCameraFrame(value).snapshot?.image.length).toBe(5592431);
    value.structuredContent.byteLength++;
    expect(() => parseCameraFrame(value)).toThrow();
  });
  it('projects only bounded downstream signaling and drops unknown fields', () => {
    expect(parseCameraOffer(offer())).toEqual({ sessionId: id, sdp: 'fixture-offer', iceServers: [{ urls: ['stun:relay.invalid', 'turns:relay.invalid'], username: 'fixture-user', credential: 'fixture-secret' }] });
    for (const mutate of [
      (value: ReturnType<typeof offer>) => { value._meta.cameraStream.transport = 'http'; },
      (value: ReturnType<typeof offer>) => { value._meta.cameraStream.offer.type = 'answer'; },
      (value: ReturnType<typeof offer>) => { value._meta.cameraStream.offer.sdp = 'x'.repeat(96 * 1024 + 1); },
      (value: ReturnType<typeof offer>) => { value._meta.cameraStream.iceServers[0].urls = ['https://private.invalid']; },
      (value: ReturnType<typeof offer>) => { value._meta.cameraStream.iceServers[0].credential = 'x'.repeat(1025); },
    ]) { const value = offer(); mutate(value); expect(() => parseCameraOffer(value)).toThrow('Invalid Camera response'); }
  });
  it('uses only closed existing calls and retains nullable candidate fields', async () => {
    const callTool = vi.fn().mockResolvedValueOnce(frame()).mockResolvedValueOnce(frame()).mockResolvedValueOnce(offer())
      .mockResolvedValueOnce(ack({ accepted: true })).mockResolvedValueOnce(ack({ accepted: true, candidateCount: 0 })).mockResolvedValueOnce(ack({ closed: false }));
    const port = cameraTransport({ callTool });
    await port.frame({ authorizeLive: false }); await port.frame({ authorizeLive: true });
    await port.open(activation); await port.answer(id, 'fixture-answer');
    const candidate = { candidate: 'fixture-candidate', sdpMid: null, sdpMLineIndex: null, usernameFragment: null };
    await port.candidates(id, [candidate]); await port.close(id);
    expect(callTool.mock.calls).toEqual([
      ['get_u1_camera_frame', {}], ['get_u1_camera_frame', { authorizeLive: true }],
      ['open_u1_camera_stream', { activationToken: activation }],
      ['answer_u1_camera_stream', { sessionId: id, sdp: 'fixture-answer' }],
      ['add_u1_camera_ice_candidates', { sessionId: id, candidates: [candidate] }],
      ['close_u1_camera_stream', { sessionId: id }],
    ]);
  });
  it('rejects malformed outgoing arguments before any host call', async () => {
    const callTool = vi.fn(); const port = cameraTransport({ callTool });
    await expect(port.open('short')).rejects.toThrow();
    await expect(port.answer(id, '')).rejects.toThrow();
    await expect(port.candidates(id, [])).rejects.toThrow();
    await expect(port.candidates(id, [{ candidate: 'fixture', sdpMid: null, sdpMLineIndex: -1 }])).rejects.toThrow();
    await expect(port.close('short')).rejects.toThrow();
    expect(callTool).not.toHaveBeenCalled();
  });
  it('releases only a returned valid capability when an allocated offer is malformed', async () => {
    const result = offer(); result._meta.cameraStream.offer.type = 'answer';
    const callTool = vi.fn().mockResolvedValueOnce(result).mockResolvedValue(ack({ closed: true }));
    await expect(cameraTransport({ callTool }).open(activation)).rejects.toThrow('Camera offer unavailable');
    expect(callTool).toHaveBeenLastCalledWith('close_u1_camera_stream', { sessionId: id });
    result._meta.cameraStream.sessionId = 'short'; callTool.mockClear().mockResolvedValue(result);
    await expect(cameraTransport({ callTool }).open(activation)).rejects.toThrow();
    expect(callTool).toHaveBeenCalledTimes(1);
  });
  it('fails closed on rejected or impossible acknowledgements', async () => {
    const callTool = vi.fn().mockResolvedValue(ack({ accepted: false })); const port = cameraTransport({ callTool });
    await expect(port.answer(id, 'fixture-answer')).rejects.toThrow();
    callTool.mockResolvedValue(ack({ accepted: true, candidateCount: 2 }));
    await expect(port.candidates(id, [{ candidate: 'fixture', sdpMid: null, sdpMLineIndex: 0 }])).rejects.toThrow();
    await expect(port.close(id)).rejects.toThrow();
  });
});
