export const U1_RUNTIME_VERSION = "0.4.13";
export const U1_TOOL_SCHEMA_VERSION = 16;
export const U1_OBSERVATION_WIDGET_VERSION = "observation-v19";
export const U1_CAMERA_WIDGET_VERSION = "camera-v15";

export const runtimeHealth = (auth: "personal-oauth" | "local-only") => {
  return {
    ok: true,
    auth,
    runtimeVersion: U1_RUNTIME_VERSION,
    toolSchemaVersion: U1_TOOL_SCHEMA_VERSION,
    observationWidgetVersion: U1_OBSERVATION_WIDGET_VERSION,
    cameraWidgetVersion: U1_CAMERA_WIDGET_VERSION,
  };
};
