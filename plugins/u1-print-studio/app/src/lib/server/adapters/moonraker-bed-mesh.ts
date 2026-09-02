import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { normalizePrinterBaseUrl } from "../local-config.js";
import { unavailableBedMesh, type BedMeshObservation } from "../application/bed-mesh-observation.js";

export const BED_MESH_ROUTE = "/printer/objects/query?bed_mesh=profile_name,mesh_min,mesh_max,probed_matrix";
export const BED_MESH_MAX_BYTES = 512 * 1024;
export const BED_MESH_MAX_DIMENSION = 64;
const execFileAsync = promisify(execFile);
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const finiteBounded = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 1_000_000;
const pair = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2 && value.every(finiteBounded);

export function normalizeBedMeshResponse(payload: unknown, observedAt: string): BedMeshObservation {
  const status = object(object(object(payload)?.result)?.status);
  if (!status) return unavailableBedMesh("malformed", observedAt);
  if (!Object.hasOwn(status, "bed_mesh")) return unavailableBedMesh("not_reported", observedAt);
  const mesh = object(status.bed_mesh);
  if (!mesh || !Object.hasOwn(mesh, "profile_name") || !pair(mesh.mesh_min) || !pair(mesh.mesh_max)) return unavailableBedMesh("malformed", observedAt);
  const matrix = mesh.probed_matrix;
  const inactive = mesh.profile_name === "" && [...mesh.mesh_min, ...mesh.mesh_max].every(n => n === 0) &&
    Array.isArray(matrix) && matrix.length === 1 && Array.isArray(matrix[0]) && matrix[0].length === 0;
  const result: BedMeshObservation = {
    state: "known", freshness: "fresh", status: inactive ? "no_active_mesh" : "active",
    sourceObservedAt: observedAt, receivedAt: observedAt, checkedAt: observedAt,
    matrix: null, bounds: null, summary: null, reason: null,
  };
  if (inactive) return result;
  if (!Array.isArray(matrix) || matrix.length < 2 ||
      !Array.isArray(matrix[0]) || matrix[0].length < 2 ||
      mesh.mesh_max[0] <= mesh.mesh_min[0] || mesh.mesh_max[1] <= mesh.mesh_min[1]) {
    return unavailableBedMesh("malformed", observedAt);
  }
  const columns = matrix[0].length;
  if (matrix.length > BED_MESH_MAX_DIMENSION || columns > BED_MESH_MAX_DIMENSION) {
    return unavailableBedMesh("too_large", observedAt);
  }
  if (!matrix.every(row => Array.isArray(row) && row.length === columns && row.every(finiteBounded))) {
    return unavailableBedMesh("malformed", observedAt);
  }
  // Klipper indexes its reported probe grid [y][x], both in ascending order.
  // This is not the interpolated mesh_matrix, nor a new physical measurement.
  result.matrix = matrix.map(row => [...row]);
  result.bounds = { xMin: mesh.mesh_min[0], yMin: mesh.mesh_min[1], xMax: mesh.mesh_max[0], yMax: mesh.mesh_max[1] };
  const values = result.matrix.flat();
  const min = Math.min(...values); const max = Math.max(...values);
  result.summary = { rows: matrix.length, columns, min, max, range: max - min };
  // Never pass paths, URLs, multiline text or directional controls to a card.
  if (typeof mesh.profile_name === "string" && /^[\p{L}\p{N} _.-]{1,80}$/u.test(mesh.profile_name) &&
      mesh.profile_name.trim() && mesh.profile_name !== "." && mesh.profile_name !== "..") {
    result.profile = mesh.profile_name.trim();
  }
  return result;
}

export async function readMoonrakerBedMesh(baseUrl: string | URL, now: () => Date = () => new Date()): Promise<BedMeshObservation> {
  let url: URL;
  try { url = new URL(BED_MESH_ROUTE, normalizePrinterBaseUrl(String(baseUrl))); }
  catch { return unavailableBedMesh("not_configured", now().toISOString()); }
  try {
    const { stdout } = await execFileAsync("curl", [
      "--disable", "--noproxy", "*", "--silent", "--show-error", "--request", "GET",
      "--connect-timeout", "3", "--max-time", "6", "--header", "accept: application/json",
      "--write-out", "\n%{http_code}", url.toString(),
    ], { maxBuffer: BED_MESH_MAX_BYTES + 4 });
    const checkedAt = now().toISOString();
    const separator = stdout.lastIndexOf("\n");
    const code = Number(stdout.slice(separator + 1));
    const body = stdout.slice(0, separator);
    if (Buffer.byteLength(body) > BED_MESH_MAX_BYTES) return unavailableBedMesh("too_large", checkedAt);
    if (code === 404 || code === 405) return unavailableBedMesh("unsupported", checkedAt);
    if (code === 401 || code === 403) return unavailableBedMesh("unauthorized", checkedAt);
    if (code !== 200) return unavailableBedMesh("http_error", checkedAt);
    let payload: unknown;
    try { payload = JSON.parse(body); }
    catch { return unavailableBedMesh("malformed", checkedAt); }
    const result = normalizeBedMeshResponse(payload, checkedAt);
    if (result.state !== "known") return result;
    const receipt = now().toISOString();
    return { ...result, sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt };
  } catch (error) {
    const code = object(error)?.code;
    return unavailableBedMesh(code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "too_large" :
      code === 28 ? "timeout" : "network", now().toISOString());
  }
}
