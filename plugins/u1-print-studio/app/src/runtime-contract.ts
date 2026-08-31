export const U1_RUNTIME_VERSION = "0.4.4";
export const U1_TOOL_SCHEMA_VERSION = 10;
export const U1_OBSERVATION_WIDGET_VERSION = "observation-v10";
export const U1_CAMERA_WIDGET_VERSION = "camera-v8";

export function runtimeHealth(auth: "personal-oauth" | "local-only") {
  return {
    ok: true,
    auth,
    runtimeVersion: U1_RUNTIME_VERSION,
    toolSchemaVersion: U1_TOOL_SCHEMA_VERSION,
    observationWidgetVersion: U1_OBSERVATION_WIDGET_VERSION,
    cameraWidgetVersion: U1_CAMERA_WIDGET_VERSION,
  };
}
