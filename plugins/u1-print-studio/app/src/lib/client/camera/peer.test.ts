import { describe, expect, it, vi } from 'vitest';
import { createCameraPeer } from './peer';
import type { CameraOffer, CameraPeerEvents } from './session';

const offer: CameraOffer = { sessionId: 'fixture-session', sdp: 'fixture-offer', iceServers: [{ urls: 'stun:relay.invalid' }] };
const setup = () => {
  const peer = {
    onconnectionstatechange: null, onicecandidate: null, ontrack: null, ondatachannel: null,
    connectionState: 'new', localDescription: { sdp: 'fixture-answer' },
    addTransceiver: vi.fn(), close: vi.fn(), setRemoteDescription: vi.fn().mockResolvedValue(undefined),
    setLocalDescription: vi.fn().mockResolvedValue(undefined), createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'fixture-answer' }),
  };
  const events: CameraPeerEvents = { frame: vi.fn(), connection: vi.fn(), candidate: vi.fn(), ended: vi.fn() };
  const stream = {} as MediaStream; const detach = vi.fn();
  const ports = { connection: vi.fn().mockReturnValue(peer), stream: vi.fn().mockReturnValue(stream), surface: { attach: vi.fn().mockReturnValue(detach) } };
  const adapter = createCameraPeer(offer, events, ports);
  const browser = peer as unknown as RTCPeerConnection;
  return { peer, browser, events, stream, detach, ports, adapter };
};
const track = () => Object.assign(new EventTarget(), { kind: 'video', stop: vi.fn() }) as unknown as MediaStreamTrack;
const receiveTrack = (peer: RTCPeerConnection, value: MediaStreamTrack) => peer.ontrack?.call(peer, { track: value } as RTCTrackEvent);

describe('downstream-only real Camera peer adapter', () => {
  it('applies only the downstream offer, singleflights answer and uses receive-only video', async () => {
    const app = setup();
    expect(app.ports.connection).toHaveBeenCalledWith({ iceServers: offer.iceServers });
    expect(app.peer.addTransceiver).toHaveBeenCalledExactlyOnceWith('video', { direction: 'recvonly' });
    const answer = app.adapter.answer(); expect(app.adapter.answer()).toBe(answer);
    expect(await answer).toBe('fixture-answer');
    expect(app.peer.setRemoteDescription).toHaveBeenCalledExactlyOnceWith({ type: 'offer', sdp: 'fixture-offer' });
    expect(app.peer.setLocalDescription).toHaveBeenCalledExactlyOnceWith({ type: 'answer', sdp: 'fixture-answer' });
  });
  it('binds one owned video track and ignores duplicates without remounting the surface', () => {
    const app = setup(), value = track();
    receiveTrack(app.browser, value); receiveTrack(app.browser, value);
    expect(app.ports.stream).toHaveBeenCalledExactlyOnceWith([value]);
    expect(app.ports.surface.attach).toHaveBeenCalledTimes(1);
    const callbacks = app.ports.surface.attach.mock.calls[0][1];
    callbacks.frame({ kind: 'presented', count: 3, at: 100 });
    expect(app.events.frame).toHaveBeenCalledTimes(1);
    app.adapter.dispose(); app.adapter.dispose();
    expect(value.stop).toHaveBeenCalledTimes(1); expect(app.detach).toHaveBeenCalledTimes(1); expect(app.peer.close).toHaveBeenCalledTimes(1);
    callbacks.frame({ kind: 'presented', count: 4, at: 200 }); callbacks.ended(); value.dispatchEvent(new Event('ended'));
    expect(app.events.frame).toHaveBeenCalledTimes(1); expect(app.events.ended).not.toHaveBeenCalled();
  });
  it('rejects a second track, stops a late track and suppresses stale callbacks', () => {
    const app = setup(); const callback = app.browser.ontrack!;
    receiveTrack(app.browser, track()); const extra = track(); receiveTrack(app.browser, extra);
    expect(extra.stop).toHaveBeenCalledOnce(); expect(app.events.ended).toHaveBeenCalledOnce();
    app.adapter.dispose(); const late = track(); callback.call(app.browser, { track: late } as RTCTrackEvent);
    expect(late.stop).toHaveBeenCalledOnce(); expect(app.ports.surface.attach).toHaveBeenCalledOnce();
  });
  it('preserves nullable ICE fields and the keepalive protocol without tool calls', () => {
    const app = setup();
    app.browser.onicecandidate!.call(app.browser, { candidate: { toJSON: () => ({ candidate: 'fixture-candidate', sdpMid: null, sdpMLineIndex: 0, usernameFragment: 'fixture-fragment' }) } } as RTCPeerConnectionIceEvent);
    expect(app.events.candidate).toHaveBeenCalledWith({ candidate: 'fixture-candidate', sdpMid: null, sdpMLineIndex: 0, usernameFragment: 'fixture-fragment' });
    const channel = { label: 'keepalive', readyState: 'open', onmessage: null as unknown as () => void, send: vi.fn(), close: vi.fn() };
    app.browser.ondatachannel!.call(app.browser, { channel } as unknown as RTCDataChannelEvent);
    channel.onmessage(); expect(channel.send).toHaveBeenCalledWith('pong');
    app.adapter.dispose(); expect(channel.close).toHaveBeenCalledOnce(); expect(channel.onmessage).toBeNull();
  });
  it('does not answer after disposal during remote description', async () => {
    const app = setup(); let resolve!: () => void;
    app.peer.setRemoteDescription.mockReturnValue(new Promise<void>((done) => { resolve = done; }));
    const answer = app.adapter.answer(); app.adapter.dispose(); resolve();
    await expect(answer).rejects.toThrow('Camera peer closed'); expect(app.peer.createAnswer).not.toHaveBeenCalled();
  });
  it('signals connection loss and handles surface binding failure without leaking callbacks', () => {
    const app = setup(); app.peer.connectionState = 'disconnected';
    app.browser.onconnectionstatechange!.call(app.browser, new Event('connectionstatechange'));
    expect(app.events.connection).toHaveBeenCalledWith('disconnected');
    app.ports.surface.attach.mockImplementation(() => { throw new Error('fixture failure'); });
    receiveTrack(app.browser, track()); expect(app.events.ended).toHaveBeenCalledOnce();
    app.adapter.dispose();
  });
});
