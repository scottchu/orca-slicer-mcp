import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isIP } from "node:net";
import { homedir, platform } from "node:os";
import path from "node:path";

export type U1LocalConfig = {
  schemaVersion: 1;
  printer: {
    baseUrl: string;
  };
};

export function defaultConfigPath(environment = process.env): string {
  const override = environment.U1_PRINT_STUDIO_CONFIG?.trim();
  if (override) return path.resolve(override);
  if (platform() === "darwin") {
    return path.join(
      homedir(),
      "Library",
      "Application Support",
      "U1 Print Studio",
      "config.json"
    );
  }
  if (platform() === "win32") {
    const appData = environment.APPDATA?.trim();
    return path.join(
      appData || path.join(homedir(), "AppData", "Roaming"),
      "U1 Print Studio",
      "config.json"
    );
  }
  const xdg = environment.XDG_CONFIG_HOME?.trim();
  return path.join(xdg || path.join(homedir(), ".config"), "u1-print-studio", "config.json");
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part))) {
    return false;
  }
  return (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized)
  );
}

export function normalizePrinterBaseUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Printer URL must use http or https");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Printer URL cannot contain credentials, query, or fragment");
  }
  if (url.pathname !== "/") {
    throw new Error("Printer URL must identify an origin without a path");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const addressFamily = isIP(hostname);
  const privateHost =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    (addressFamily === 4 && isPrivateIpv4(hostname)) ||
    (addressFamily === 6 && isPrivateIpv6(hostname));
  if (!privateHost) {
    throw new Error("Printer URL must use a private, link-local, or loopback host");
  }
  return url.toString();
}

export function readLocalConfig(configPath = defaultConfigPath()): U1LocalConfig {
  if (!existsSync(configPath)) {
    throw new Error(`U1 Print Studio is not set up; run 'u1-print-studio setup'`);
  }
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(configPath, "utf8"));
  } catch {
    throw new Error("U1 Print Studio configuration is not valid JSON");
  }
  const object = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const printer = object.printer && typeof object.printer === "object"
    ? object.printer as Record<string, unknown>
    : {};
  if (object.schemaVersion !== 1 || typeof printer.baseUrl !== "string") {
    throw new Error("U1 Print Studio configuration schema is invalid");
  }
  return {
    schemaVersion: 1,
    printer: { baseUrl: normalizePrinterBaseUrl(printer.baseUrl) },
  };
}

export function writeLocalConfig(
  printerUrl: string,
  configPath = defaultConfigPath()
): U1LocalConfig {
  const config: U1LocalConfig = {
    schemaVersion: 1,
    printer: { baseUrl: normalizePrinterBaseUrl(printerUrl) },
  };
  mkdirSync(path.dirname(configPath), { recursive: true, mode: 0o700 });
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  if (platform() !== "win32") {
    chmodSync(configPath, 0o600);
  }
  return config;
}
