export const BED_MESH_TTL_MS = 15_000;
export type BedMeshReason = "not_requested" | "not_reported" | "unsupported" |
  "unauthorized" | "http_error" | "timeout" | "network" | "malformed" |
  "too_large" | "not_configured";

export type BedMeshObservation = {
  state: "known" | "stale" | "unknown" | "unsupported" | "unavailable";
  freshness: "fresh" | "stale" | "unknown";
  status: "active" | "no_active_mesh" | null;
  sourceObservedAt: string | null;
  receivedAt: string | null;
  checkedAt: string | null;
  profile?: string;
  matrix: number[][] | null;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number } | null;
  summary: { rows: number; columns: number; min: number; max: number; range: number } | null;
  reason: BedMeshReason | null;
};
export type BedMeshReader = () => Promise<BedMeshObservation>;

export function unavailableBedMesh(reason: BedMeshReason, checkedAt: string | null = null): BedMeshObservation {
  return {
    state: reason === "not_requested" ? "unknown" :
      reason === "unsupported" || reason === "not_reported" ? "unsupported" : "unavailable",
    freshness: "unknown", status: null, sourceObservedAt: null, receivedAt: null,
    checkedAt, matrix: null, bounds: null, summary: null, reason,
  };
}
