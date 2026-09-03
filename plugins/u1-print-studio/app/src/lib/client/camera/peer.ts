import type { VideoSurfacePort } from '../media/playback';
import type { CameraOffer, CameraPeer, CameraPeerEvents } from './session';

export type CameraPeerPorts = {
  connection: (configuration: RTCConfiguration) => RTCPeerConnection;
  stream: (tracks: MediaStreamTrack[]) => MediaStream;
  surface: VideoSurfacePort;
};

/** Only the server-terminated downstream offer enters the browser peer. */
export const createCameraPeer = (offer: CameraOffer, events: CameraPeerEvents, ports: CameraPeerPorts): CameraPeer => {
  const peer = ports.connection({ iceServers: [...offer.iceServers] });
  try { peer.addTransceiver('video', { direction: 'recvonly' }); }
  catch { peer.close(); throw new Error('Camera peer unavailable'); }
  let disposed = false;
  let detach: (() => void) | null = null;
  let answering: Promise<string> | null = null;
  const tracks = new Set<MediaStreamTrack>();
  const channels = new Set<RTCDataChannel>();
  const current = () => !disposed;
  const ended = () => { if (current()) events.ended(); };
  peer.onconnectionstatechange = () => {
    if (!current()) return;
    const state = peer.connectionState;
    events.connection(state);
  };
  peer.onicecandidate = (event) => {
    if (!current() || !event.candidate) return;
    const value = event.candidate.toJSON();
    if (!value.candidate) return;
    events.candidate({ candidate: value.candidate, sdpMid: value.sdpMid ?? null, sdpMLineIndex: value.sdpMLineIndex ?? null,
      ...(value.usernameFragment === undefined ? {} : { usernameFragment: value.usernameFragment }) });
  };
  peer.ondatachannel = (event) => {
    if (!current()) { event.channel.close(); return; }
    const channel = event.channel;
    channels.add(channel);
    if (channel.label !== 'keepalive') { channel.close(); return; }
    channel.onmessage = () => {
      if (current() && channel.readyState === 'open') {
        try { channel.send('pong'); } catch { ended(); }
      }
    };
  };
  peer.ontrack = (event) => {
    if (!current()) { event.track.stop(); return; }
    if (event.track.kind !== 'video') { event.track.stop(); return; }
    if (tracks.has(event.track)) return;
    // A bounded single downstream video is the only accepted display source.
    if (tracks.size) { event.track.stop(); ended(); return; }
    tracks.add(event.track);
    event.track.addEventListener('ended', ended);
    try {
      detach = ports.surface.attach(ports.stream([event.track]), {
        frame: (evidence) => { if (current()) events.frame(evidence); }, ended,
      });
    } catch { ended(); }
  };
  return {
    answer: () => {
      if (answering) return answering;
      answering = (async () => {
        if (!current()) throw new Error('Camera peer closed');
        await peer.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
        if (!current()) throw new Error('Camera peer closed');
        const answer = await peer.createAnswer();
        if (!current()) throw new Error('Camera peer closed');
        await peer.setLocalDescription(answer);
        if (!current() || !peer.localDescription?.sdp) throw new Error('Camera answer unavailable');
        return peer.localDescription.sdp;
      })();
      return answering;
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      detach?.(); detach = null;
      peer.onconnectionstatechange = null; peer.onicecandidate = null; peer.ontrack = null; peer.ondatachannel = null;
      channels.forEach((channel) => { channel.onmessage = null; channel.close(); });
      tracks.forEach((track) => { track.removeEventListener('ended', ended); track.stop(); });
      peer.close();
    },
  };
};
