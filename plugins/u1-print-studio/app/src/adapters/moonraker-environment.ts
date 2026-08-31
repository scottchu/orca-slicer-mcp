import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { normalizePrinterBaseUrl } from "../local-config.js";
import { unavailableEnvironment, unreportedEnvironmentFans, type EnvironmentObservation } from "../application/environment-observation.js";

export const ENVIRONMENT_ROUTE = "/printer/objects/query?temperature_sensor%20cavity=temperature&fan=speed,rpm&fan_generic%20e1_fan=speed,rpm&fan_generic%20e2_fan=speed,rpm&fan_generic%20e3_fan=speed,rpm&fan_generic%20cavity_fan=speed,rpm&purifier=power_detected,mode,exhaust_fan,inner_fan,inner_fan_rpm";
export const ENVIRONMENT_MAX_BYTES = 512 * 1024;
const execute = promisify(execFile);
const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const present = (record: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(record, key);
const bounded = (value: unknown, min: number, max: number): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;

type OptionalNumber = { reported: boolean; value: number | null };
function optionalNumber(record: Record<string, unknown>, key: string, min: number, max: number, nullable = false): OptionalNumber | null {
  if (!present(record, key)) return { reported: false, value: null };
  if (record[key] === null) return nullable ? { reported: true, value: null } : null;
  const value = bounded(record[key], min, max);
  return value === null ? null : { reported: true, value };
}

export function normalizeEnvironmentResponse(payload: unknown, observedAt: string): EnvironmentObservation {
  const status = object(object(payload)?.result)?.status;
  const objects = object(status);
  if (!objects) return unavailableEnvironment("malformed", observedAt);
  const fans = unreportedEnvironmentFans();
  const objectFans: Array<[number, string]> = [
    [0, "fan"], [1, "fan_generic e1_fan"], [2, "fan_generic e2_fan"],
    [3, "fan_generic e3_fan"], [4, "fan_generic cavity_fan"],
  ];
  for (const [index, name] of objectFans) {
    if (!present(objects, name)) continue;
    const raw = object(objects[name]);
    if (!raw) return unavailableEnvironment("malformed", observedAt);
    const speed = optionalNumber(raw, "speed", 0, 1);
    const rpm = optionalNumber(raw, "rpm", 0, 1_000_000, true);
    if (!speed || !rpm) return unavailableEnvironment("malformed", observedAt);
    if (speed.reported || rpm.reported) fans[index] = {
      ...fans[index]!, state: "known", speedReported: speed.reported,
      speedFraction: speed.value, rpmReported: rpm.reported, rpm: rpm.value,
    };
  }
  let cavity: EnvironmentObservation["cavity"] = { state: "not_reported", temperatureC: null };
  if (present(objects, "temperature_sensor cavity")) {
    const raw = object(objects["temperature_sensor cavity"]);
    if (!raw) return unavailableEnvironment("malformed", observedAt);
    const temperature = optionalNumber(raw, "temperature", -273.15, 999);
    if (!temperature) return unavailableEnvironment("malformed", observedAt);
    if (temperature.reported) cavity = { state: "known", temperatureC: temperature.value };
  }
  let purifier: EnvironmentObservation["purifier"] = { state: "not_reported", powerDetected: null, mode: null };
  if (present(objects, "purifier")) {
    const raw = object(objects.purifier);
    if (!raw) return unavailableEnvironment("malformed", observedAt);
    if (present(raw, "power_detected") && typeof raw.power_detected !== "boolean") return unavailableEnvironment("malformed", observedAt);
    const power = typeof raw.power_detected === "boolean" ? raw.power_detected : null;
    purifier = { state: power === null ? "not_reported" : "known", powerDetected: power, mode: null };
    if (power === true) {
      purifier.mode = ({ 0: "idle", 1: "cool_chamber", 2: "preheat_chamber", 3: "hot_chamber" } as const)[String(raw.mode) as "0" | "1" | "2" | "3"] ?? null;
      for (const [index, key] of [[5, "exhaust_fan"], [6, "inner_fan"]] as const) {
        if (!present(raw, key)) continue;
        const nested = object(raw[key]);
        if (!nested) return unavailableEnvironment("malformed", observedAt);
        const speed = optionalNumber(nested, "speed", 0, 1);
        if (!speed) return unavailableEnvironment("malformed", observedAt);
        if (speed.reported) fans[index] = {
          ...fans[index]!, state: "known", speedReported: true, speedFraction: speed.value,
          rpmReported: false, rpm: null,
        };
      }
      const innerRpm = optionalNumber(raw, "inner_fan_rpm", 0, 1_000_000, true);
      if (!innerRpm) return unavailableEnvironment("malformed", observedAt);
      if (innerRpm.reported) fans[6] = {
        ...fans[6]!, state: "known", rpmReported: true, rpm: innerRpm.value,
      };
    }
  }
  return {
    state: "known", freshness: "fresh", sourceObservedAt: observedAt, receivedAt: observedAt,
    checkedAt: observedAt, cavity, fans, purifier, reason: null,
  };
}

export async function readMoonrakerEnvironment(baseUrl: string | URL, now: () => Date = () => new Date()): Promise<EnvironmentObservation> {
  let url: URL;
  try { url = new URL(ENVIRONMENT_ROUTE, normalizePrinterBaseUrl(String(baseUrl))); }
  catch { return unavailableEnvironment("not_configured", now().toISOString()); }
  try {
    const { stdout } = await execute("curl", [
      "--disable", "--noproxy", "*", "--silent", "--show-error", "--request", "GET",
      "--connect-timeout", "3", "--max-time", "6", "--header", "accept: application/json",
      "--write-out", "\n%{http_code}", url.toString(),
    ], { maxBuffer: ENVIRONMENT_MAX_BYTES + 4, timeout: 6500 });
    const checkedAt = now().toISOString();
    const separator = stdout.lastIndexOf("\n");
    const body = stdout.slice(0, separator); const status = Number(stdout.slice(separator + 1));
    if (Buffer.byteLength(body, "utf8") > ENVIRONMENT_MAX_BYTES) return unavailableEnvironment("too_large", checkedAt);
    if (status === 404 || status === 405) return unavailableEnvironment("unsupported", checkedAt);
    if (status === 401 || status === 403) return unavailableEnvironment("unauthorized", checkedAt);
    if (status !== 200) return unavailableEnvironment("http_error", checkedAt);
    let payload: unknown;
    try { payload = JSON.parse(body); } catch { return unavailableEnvironment("malformed", checkedAt); }
    const result = normalizeEnvironmentResponse(payload, checkedAt);
    if (result.state !== "known") return result;
    const receipt = now().toISOString();
    return { ...result, sourceObservedAt: receipt, receivedAt: receipt, checkedAt: receipt };
  } catch (error) {
    const failure = object(error);
    return unavailableEnvironment(failure?.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "too_large" :
      failure?.code === 28 || failure?.killed === true ? "timeout" : "network", now().toISOString());
  }
}
