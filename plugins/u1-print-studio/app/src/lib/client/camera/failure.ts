export type CameraLiveFailureStage =
  | 'activation'
  | 'offer'
  | 'local-answer'
  | 'answer'
  | 'candidate'
  | 'connection'
  | 'first-frame'
  | 'playback';

export type CameraLiveFailureOutcome = 'timeout' | 'rejected' | 'failed' | 'ended';
export type CameraConnectionState = RTCPeerConnectionState | 'not-created';

/** One private attempt summary. Never retain transport payloads or exceptions. */
export type CameraLiveFailure = Readonly<{
  stage: CameraLiveFailureStage;
  outcome: CameraLiveFailureOutcome;
  elapsedMs: number;
  connectionState: CameraConnectionState;
  hadFrame: boolean;
}>;

const labels: Record<CameraLiveFailureStage, string> = {
  activation: 'Live setup',
  offer: 'Live request',
  'local-answer': 'Video setup',
  answer: 'Live reply',
  candidate: 'Connection update',
  connection: 'Connection',
  'first-frame': 'Video',
  playback: 'Video',
};

/** Closed product wording, independent of any server or browser error text. */
export const cameraLiveFailureMessage = (failure: CameraLiveFailure): string => {
  if (failure.stage === 'playback' && failure.outcome === 'timeout' && failure.hadFrame) return 'Video stalled';
  const label = failure.stage === 'first-frame' && failure.connectionState !== 'connected'
    ? 'Connection'
    : labels[failure.stage];
  if (failure.outcome === 'timeout') return `${label} timed out`;
  if (failure.outcome === 'ended') return `${label} ended`;
  return `${label} failed`;
};
