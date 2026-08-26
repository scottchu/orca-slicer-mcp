import { createCameraTicketCodec } from "./adapters/camera-ticket-codec.js";
import {
  CameraWebRtcSessionService,
  createCameraWebRtcSessionController,
  type CameraWebRtcSignalingSource,
} from "./application/camera-webrtc.js";
import { CameraRelayService } from "./application/camera-relay.js";
import { u1CameraWebRtcSignaling } from "./u1-status.js";

export function createCameraRuntime(
  signaling: CameraWebRtcSignalingSource = u1CameraWebRtcSignaling
) {
  const codec = createCameraTicketCodec();
  const relay = new CameraRelayService(codec);
  const sessions = new CameraWebRtcSessionService(codec, signaling);
  return {
    relay,
    sessions,
    controller: createCameraWebRtcSessionController(relay, sessions),
  };
}
