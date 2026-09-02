export const ENVIRONMENT_TTL_MS = 15_000;
export type EnvironmentReason = "not_requested" | "unsupported" | "unauthorized" |
  "http_error" | "timeout" | "network" | "malformed" | "too_large" | "not_configured";
export type ReportedState = "known" | "not_reported";
export type EnvironmentFan = {
  id: "tool-1-part" | "tool-2-part" | "tool-3-part" | "tool-4-part" |
    "cavity" | "purifier-exhaust" | "purifier-inner";
  label: string;
  group: "part_cooling" | "air_handling";
  state: ReportedState;
  speedReported: boolean;
  speedFraction: number | null;
  rpmReported: boolean;
  rpm: number | null;
};
export type EnvironmentObservation = {
  state: "known" | "stale" | "unknown" | "unsupported" | "unavailable";
  freshness: "fresh" | "stale" | "unknown";
  sourceObservedAt: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
  cavity: { state: ReportedState; temperatureC: number | null };
  fans: EnvironmentFan[];
  purifier: {
    state: ReportedState;
    powerDetected: boolean | null;
    mode: "idle" | "cool_chamber" | "preheat_chamber" | "hot_chamber" | null;
  };
  reason: EnvironmentReason | null;
};
export type EnvironmentReader = () => Promise<EnvironmentObservation>;

const fanDefinitions: Array<Pick<EnvironmentFan, "id" | "label" | "group">> = [
  { id: "tool-1-part", label: "Tool 1 part cooling", group: "part_cooling" },
  { id: "tool-2-part", label: "Tool 2 part cooling", group: "part_cooling" },
  { id: "tool-3-part", label: "Tool 3 part cooling", group: "part_cooling" },
  { id: "tool-4-part", label: "Tool 4 part cooling", group: "part_cooling" },
  { id: "cavity", label: "Cavity fan", group: "air_handling" },
  { id: "purifier-exhaust", label: "Purifier exhaust", group: "air_handling" },
  { id: "purifier-inner", label: "Purifier inner fan", group: "air_handling" },
];

export function unreportedEnvironmentFans(): EnvironmentFan[] {
  return fanDefinitions.map(item => ({ ...item, state: "not_reported", speedReported: false,
    speedFraction: null, rpmReported: false, rpm: null }));
}

export function unavailableEnvironment(reason: EnvironmentReason, checkedAt: string | null = null): EnvironmentObservation {
  return {
    state: reason === "not_requested" ? "unknown" : reason === "unsupported" ? "unsupported" : "unavailable",
    freshness: "unknown", sourceObservedAt: null, receivedAt: null, checkedAt,
    cavity: { state: "not_reported", temperatureC: null }, fans: unreportedEnvironmentFans(),
    purifier: { state: "not_reported", powerDetected: null, mode: null }, reason,
  };
}
