/** Test-only local media. Never imported by the production entry or packaging. */
export const installCameraPeerFixture = () => {
  const probe = { opens: 0, closed: 0, paused: false, tracks: [] as MediaStreamTrack[] };
  Object.assign(window, { __cameraProbe: probe });
  class FixturePeer {
    ontrack: ((event: { track: MediaStreamTrack }) => void) | null = null;
    onconnectionstatechange: (() => void) | null = null;
    onicecandidate = null;
    ondatachannel = null;
    connectionState = 'new';
    localDescription: RTCSessionDescriptionInit | null = null;
    animation = 0;
    stream: MediaStream | null = null;
    addTransceiver = () => {};
    setRemoteDescription = async () => {};
    createAnswer = async () => ({ type: 'answer' as const, sdp: 'fixture-downstream-answer' });
    setLocalDescription = async (value: RTCSessionDescriptionInit) => {
      this.localDescription = value; probe.opens++;
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
      const context = canvas.getContext('2d')!;
      const draw = (at: number) => {
        if (!probe.paused) { context.fillStyle = '#edf1f4'; context.fillRect(0, 0, 640, 360); context.fillStyle = '#eab941'; context.fillRect(100 + Math.sin(at / 1000) * 30, 70, 160, 150); }
        this.animation = requestAnimationFrame(draw);
      };
      draw(0); this.stream = canvas.captureStream(15);
      const track = this.stream.getVideoTracks()[0]; probe.tracks.push(track);
      this.connectionState = 'connected'; this.onconnectionstatechange?.(); this.ontrack?.({ track });
    };
    close = () => { probe.closed++; cancelAnimationFrame(this.animation); this.stream?.getTracks().forEach((track) => track.stop()); };
  }
  Object.defineProperty(window, 'RTCPeerConnection', { value: FixturePeer, configurable: true });
};
