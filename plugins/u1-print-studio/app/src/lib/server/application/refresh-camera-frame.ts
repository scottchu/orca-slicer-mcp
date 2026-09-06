import { cameraFramePayload } from '../camera-payload.js';
import type { readU1CameraFrame } from '../u1-status.js';
import type { CameraWebRtcSessionController } from './camera-webrtc.js';
import { CameraRelayClaimError } from './camera-relay.js';

// Server-only outcome: a failed optional live activation does not invalidate a
// successfully acquired snapshot and never adds a new field to its wire result.
export type CameraActivationOutcome =
  | { state: 'available'; activation: { token: string; expiresAt: string } }
  | { state: 'unavailable'; reason: 'capacity' | 'unavailable' }
  | { state: 'not_requested' };

export const cameraActivation = (sessions: Pick<CameraWebRtcSessionController, 'authorize'> | undefined, requested: boolean): CameraActivationOutcome => {
  if (!requested || !sessions) return { state: 'not_requested' };
  try { return { state: 'available', activation: sessions.authorize() }; }
  catch (error) {
    return { state: 'unavailable', reason: error instanceof CameraRelayClaimError && error.reason === 'busy' ? 'capacity' : 'unavailable' };
  }
};

export const refreshCameraFrame = async (
  readFrame: typeof readU1CameraFrame,
  sessions: Pick<CameraWebRtcSessionController, 'authorize'> | undefined,
  authorizeLive: boolean,
) => {
  const { frame, metadata } = await readFrame();
  const outcome = cameraActivation(sessions, authorizeLive);
  return cameraFramePayload(frame, metadata, outcome.state === 'available' ? outcome.activation : undefined);
};
