export type CameraIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type CameraWebRtcOffer = {
  type: "offer";
  id: string;
  sdp: string;
  iceServers: CameraIceServer[];
};

export type CameraIceCandidate = {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export type CameraWebRtcSignalingSource = {
  requestOffer(signal?: AbortSignal): Promise<CameraWebRtcOffer>;
  sendAnswer(id: string, sdp: string, signal?: AbortSignal): Promise<void>;
  sendCandidates(
    id: string,
    candidates: CameraIceCandidate[],
    signal?: AbortSignal
  ): Promise<void>;
};
