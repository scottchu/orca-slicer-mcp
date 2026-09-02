import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { normalizePrinterBaseUrl } from "../local-config.js";
import { unavailableMaterials, type MaterialObservation } from "../application/material-observation.js";

// OrcaSlicer 82cedc0 SnapmakerPrinterAgent.cpp:154-177 and Snapmaker Orca
// 761718a SSWCP.cpp:1596-1701 establish these printer arrays and color forms.
// No preset/config-file read, extruder remapping, NFC data or write is needed.
export const MATERIALS_ROUTE = "/printer/objects/query?print_task_config=filament_exist,filament_vendor,filament_type,filament_sub_type,filament_color_rgba,filament_color";
export const MATERIALS_MAX_BYTES = 32 * 1024;
const execFileAsync = promisify(execFile);
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const fields = ["filament_exist", "filament_vendor", "filament_type", "filament_sub_type", "filament_color_rgba", "filament_color"] as const;

function label(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 64 || !/^[\p{L}\p{N} _+()-]*$/u.test(value)) return null;
  const text = value.trim();
  if (!text || /^(NONE|UNKNOWN|NULL|N\/A)$/i.test(text) || /^sk[-_]/i.test(text) ||
      /(?:api[-_ ]?key|password|secret|token|credential)/i.test(text) ||
      /^(?:(?:Bearer|Basic)\s|gh[pousr]_|github_pat_|glpat-|xox[baprs]-|(?:AKIA|ASIA)[A-Z0-9]{16})/i.test(text)) return null;
  return text;
}

function rgba(value: unknown): string | null {
  return typeof value === "string" && /^[0-9a-f]{8}$/i.test(value) ? `#${value.toUpperCase()}` : null;
}

function legacyColor(value: unknown): string | null {
  if (typeof value === "string" && /^[0-9a-f]{6}$/i.test(value)) return `#${value.toUpperCase()}`;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff) {
    return `#${(value & 0x00ffffff).toString(16).padStart(6, "0").toUpperCase()}`;
  }
  return null;
}

export function normalizeMaterialResponse(payload: unknown, observedAt: string): MaterialObservation {
  const status = object(object(object(payload)?.result)?.status);
  if (!status) return unavailableMaterials("malformed", observedAt);
  if (!Object.hasOwn(status, "print_task_config")) return unavailableMaterials("not_reported", observedAt);
  const config = object(status.print_task_config);
  if (!config) return unavailableMaterials("malformed", observedAt);
  const arrays = new Map<string, unknown[]>();
  for (const field of fields) {
    if (!Object.hasOwn(config, field)) continue;
    const values = config[field];
    if (!Array.isArray(values) || values.length > 4) return unavailableMaterials("malformed", observedAt);
    arrays.set(field, values);
  }
  if (![...arrays.values()].some(values => values.length > 0)) return unavailableMaterials("not_reported", observedAt);
  const at = (field: string, index: number) => arrays.get(field)?.[index];
  // A reported RGBA array is authoritative; invalid/missing entries stay unknown
  // rather than silently borrowing older color data from the legacy array.
  const hasRgba = (arrays.get("filament_color_rgba")?.length ?? 0) > 0;
  return {
    state: "known", freshness: "fresh", sourceObservedAt: observedAt,
    receivedAt: observedAt, checkedAt: observedAt, reason: null,
    items: [0, 1, 2, 3].map(index => ({
      physicalTool: index + 1,
      vendor: label(at("filament_vendor", index)),
      type: label(at("filament_type", index)),
      subtype: label(at("filament_sub_type", index)),
      color: hasRgba ? rgba(at("filament_color_rgba", index)) : legacyColor(at("filament_color", index)),
      reportedPresence: typeof at("filament_exist", index) === "boolean" ? at("filament_exist", index) as boolean : null,
    })),
  };
}

export async function readMoonrakerMaterials(baseUrl: string | URL, now: () => Date = () => new Date()): Promise<MaterialObservation> {
  let url: URL;
  try { url = new URL(MATERIALS_ROUTE, normalizePrinterBaseUrl(String(baseUrl))); }
  catch { return unavailableMaterials("not_configured", now().toISOString()); }
  try {
    const { stdout } = await execFileAsync("curl", [
      "--disable", "--noproxy", "*", "--silent", "--show-error", "--request", "GET",
      "--connect-timeout", "3", "--max-time", "6", "--header", "accept: application/json",
      "--write-out", "\n%{http_code}", url.toString(),
    ], { maxBuffer: MATERIALS_MAX_BYTES + 4 });
    const checkedAt = now().toISOString();
    const separator = stdout.lastIndexOf("\n");
    const code = Number(stdout.slice(separator + 1));
    const body = stdout.slice(0, separator);
    if (Buffer.byteLength(body) > MATERIALS_MAX_BYTES) return unavailableMaterials("too_large", checkedAt);
    if (code === 404 || code === 405) return unavailableMaterials("unsupported", checkedAt);
    if (code === 401 || code === 403) return unavailableMaterials("unauthorized", checkedAt);
    if (code !== 200) return unavailableMaterials("http_error", checkedAt);
    let payload: unknown;
    try { payload = JSON.parse(body); }
    catch { return unavailableMaterials("malformed", checkedAt); }
    return normalizeMaterialResponse(payload, checkedAt);
  } catch (error) {
    const code = object(error)?.code;
    return unavailableMaterials(code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "too_large" :
      code === 28 ? "timeout" : "network", now().toISOString());
  }
}
