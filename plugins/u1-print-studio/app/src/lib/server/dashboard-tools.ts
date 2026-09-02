import { cameraFramePayload, cameraStreamPayload, observationPayload, resultPayload } from './app.js';
import { OBSERVATION_VIEWS, type ObservationView } from './observation-presentation.js';
import type { PrinterObservationStore } from './observation-store.js';
import { readU1CameraFrame } from './u1-status.js';
import type { StatusDashboardDependencies } from './status-dashboard.js';
import type { CameraIceCandidate } from './application/camera-webrtc.js';
import type { RequestLifetime } from './request-lifetime.js';

export type ToolReply = { status: number; body: unknown };
const reply = (status: number, body: unknown): ToolReply => ({ status, body });

// One application dispatch shared by Kit HTTP and the finite compatibility adapter.
export const callDashboardTool = async (
  body: unknown, observations: PrinterObservationStore, dependencies: StatusDashboardDependencies, lifetime?: RequestLifetime
): Promise<ToolReply> => {
  const readCameraFrame = dependencies.readCameraFrame ?? readU1CameraFrame;
  try {
    const name =
      body && typeof body === "object" && "name" in body
        ? (body as { name?: unknown }).name
        : null;
    const argumentsValue =
      body && typeof body === "object" && "arguments" in body
        ? (body as { arguments?: unknown }).arguments
        : {};
    const argumentsObject =
      argumentsValue &&
      typeof argumentsValue === "object" &&
      !Array.isArray(argumentsValue)
        ? (argumentsValue as Record<string, unknown>)
        : {};

    if (name === "get_u1_status") {
      const snapshot = await observations.current({ refresh: true });
      return reply(200, resultPayload(snapshot.status, snapshot.metadata));
    }
    if (name === "refresh_printer_observation") {
      const view = argumentsObject.view;
      if (
        !OBSERVATION_VIEWS.includes(view as ObservationView) ||
        Object.keys(argumentsObject).some((key) => key !== "view")
      ) {
        return reply(400, { error: "invalid_observation_view" });
      }
      return reply(
        200,
        observationPayload(
          await observations.current({
            refresh: true,
            includeBedMesh: view === "bed_mesh" || view === "overview",
            includeMaterials: view === "heads" || view === "overview",
            includeQueue: view === "queue" || view === "overview",
            includeEnvironment: view === "thermals" || view === "fans" || view === "overview",
            includeCurrentJob: view === "jobs" || view === "overview",
            includeJobHistory: view === "job_history" || view === "overview"
          }),
          view as ObservationView
        )
      );
    }
    if (name === "get_u1_camera_frame") {
      const { frame, metadata } = await readCameraFrame();
      const activation =
        argumentsObject.authorizeLive === true && dependencies.cameraSessions
          ? dependencies.cameraSessions.authorize()
          : undefined;
      return reply(200, cameraFramePayload(frame, metadata, activation));
    }
    if (name === "open_u1_camera_stream" && dependencies.cameraSessions) {
      const opened = await dependencies.cameraSessions.open(String(argumentsObject.activationToken ?? ''));
      lifetime?.onAborted(() => { dependencies.cameraSessions!.close(opened.sessionId); });
      if (lifetime?.signal.aborted) {
        return reply(400, { error: 'invalid_request' });
      }
      return reply(200, cameraStreamPayload(opened));
    }
    if (name === "answer_u1_camera_stream" && dependencies.cameraSessions) {
      return reply(
        200,
        await dependencies.cameraSessions.answer(
          String(argumentsObject.sessionId ?? ""),
          String(argumentsObject.sdp ?? "")
        )
      );
    }
    if (
      name === "add_u1_camera_ice_candidates" &&
      dependencies.cameraSessions
    ) {
      return reply(
        200,
        await dependencies.cameraSessions.addCandidates(
          String(argumentsObject.sessionId ?? ""),
          Array.isArray(argumentsObject.candidates)
            ? argumentsObject.candidates as CameraIceCandidate[]
            : []
        )
      );
    }
    if (name === "close_u1_camera_stream" && dependencies.cameraSessions) {
      return reply(
        200,
        dependencies.cameraSessions.close(
          String(argumentsObject.sessionId ?? "")
        )
      );
    }

    return reply(400, { error: "unsupported_read_only_tool" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return reply(message === "request_too_large" ? 413 : 400, {
      error: message === "request_too_large" ? message : "invalid_request",
    });
  }
};
