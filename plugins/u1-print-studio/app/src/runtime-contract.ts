export const U1_RUNTIME_VERSION = "0.2.0";
export const U1_TOOL_SCHEMA_VERSION = 4;
export const U1_CAMERA_WIDGET_VERSION = "camera-v3";

export function runtimeHealth(auth: "personal-oauth" | "local-only") {
  return {
    ok: true,
    auth,
    runtimeVersion: U1_RUNTIME_VERSION,
    toolSchemaVersion: U1_TOOL_SCHEMA_VERSION,
    cameraWidgetVersion: U1_CAMERA_WIDGET_VERSION,
  };
}
