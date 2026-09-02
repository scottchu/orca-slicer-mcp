export const MATERIAL_TTL_MS = 15_000;
export type MaterialReason = "not_requested" | "not_reported" | "unsupported" |
  "unauthorized" | "http_error" | "timeout" | "network" | "malformed" |
  "too_large" | "not_configured";

export type ReportedMaterial = {
  physicalTool: number;
  vendor: string | null;
  type: string | null;
  subtype: string | null;
  color: string | null;
  reportedPresence: boolean | null;
};

export type MaterialObservation = {
  state: "known" | "stale" | "unknown" | "unsupported" | "unavailable";
  freshness: "fresh" | "stale" | "unknown";
  sourceObservedAt: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
  items: ReportedMaterial[];
  reason: MaterialReason | null;
};
export type MaterialReader = () => Promise<MaterialObservation>;

export function unavailableMaterials(reason: MaterialReason, checkedAt: string | null = null): MaterialObservation {
  return {
    state: reason === "not_requested" || reason === "not_reported" ? "unknown" :
      reason === "unsupported" ? "unsupported" : "unavailable",
    freshness: "unknown", sourceObservedAt: null, receivedAt: null, checkedAt,
    items: [], reason,
  };
}
