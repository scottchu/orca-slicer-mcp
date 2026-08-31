#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import {
  defaultConfigPath,
  readLocalConfig,
  writeLocalConfig,
} from "./local-config.js";
import { startStdioConnector } from "./stdio.js";
import { createCameraIceServerProvider } from "./camera-ice-config.js";
import { readU1Status } from "./u1-status.js";
import {
  U1_CAMERA_WIDGET_VERSION,
  U1_OBSERVATION_WIDGET_VERSION,
  U1_RUNTIME_VERSION,
  U1_TOOL_SCHEMA_VERSION,
} from "./runtime-contract.js";

type ParsedArguments = {
  command: string;
  printerUrl?: string;
  configPath?: string;
  offline: boolean;
  json: boolean;
  stunUrls: string[];
};

function parseArguments(argv: string[]): ParsedArguments {
  const parsed: ParsedArguments = {
    command: argv[0] ?? "help",
    offline: false,
    json: false,
    stunUrls: [],
  };
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--offline") parsed.offline = true;
    else if (argument === "--json") parsed.json = true;
    else if (argument === "--printer-url") parsed.printerUrl = argv[++index];
    else if (argument === "--config") parsed.configPath = argv[++index];
    else if (argument === "--stun-url") parsed.stunUrls.push(argv[++index] ?? "");
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return parsed;
}

async function requestedPrinterUrl(value?: string): Promise<string> {
  if (value?.trim()) return value;
  if (!stdin.isTTY) {
    throw new Error("setup requires --printer-url when input is not interactive");
  }
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    return await prompt.question(
      "U1 printer URL on this computer's private network: "
    );
  } finally {
    prompt.close();
  }
}

async function setup(args: ParsedArguments): Promise<void> {
  const configPath = args.configPath ?? defaultConfigPath();
  const printerUrl = await requestedPrinterUrl(args.printerUrl);
  writeLocalConfig(printerUrl, configPath, {
    stunUrls: args.stunUrls.length > 0 ? args.stunUrls : undefined,
  });
  readLocalConfig(configPath);
  const doctorCommand = args.configPath
    ? `u1-print-studio doctor --config ${JSON.stringify(configPath)}`
    : "u1-print-studio doctor";
  const result = {
    ok: true,
    command: "setup",
    configPath,
    next: doctorCommand,
  };
  if (args.json) console.log(JSON.stringify(result));
  else {
    console.log(`U1 Print Studio configuration saved to ${configPath}`);
    console.log(`Next: ${doctorCommand}`);
  }
}

async function doctor(args: ParsedArguments): Promise<void> {
  const configPath = args.configPath ?? defaultConfigPath();
  const config = readLocalConfig(configPath);
  const iceServers = createCameraIceServerProvider(process.env, {
    configuredStunUrls: config.camera.stunUrls,
  });
  const checks: Record<string, string> = {
    configuration: "ok",
    printerOrigin: "private-or-loopback",
    operations: "fixed-read-only-allowlist",
    hostedSignaling: "mcp-apps-tools-call",
    externalWidgetFetch: "disabled",
    iceTraversal: iceServers.hasTurn
      ? "turn-rest"
      : iceServers.hasStun
        ? "explicit-stun-only"
        : "local-candidates-only",
  };
  if (!args.offline) {
    const previousConfigPath = process.env.U1_PRINT_STUDIO_CONFIG;
    process.env.U1_PRINT_STUDIO_CONFIG = configPath;
    try {
      const { status } = await readU1Status();
      checks.printerObservation = status.reachable ? "reachable" : "unavailable";
      if (!status.reachable) {
        throw new Error("Read-only printer observation failed");
      }
    } finally {
      if (previousConfigPath === undefined) {
        delete process.env.U1_PRINT_STUDIO_CONFIG;
      } else {
        process.env.U1_PRINT_STUDIO_CONFIG = previousConfigPath;
      }
    }
  } else {
    checks.printerObservation = "skipped-offline";
  }
  const result = {
    ok: true,
    command: "doctor",
    configPath,
    runtime: process.execPath,
    contract: {
      runtimeVersion: U1_RUNTIME_VERSION,
      toolSchemaVersion: U1_TOOL_SCHEMA_VERSION,
      observationWidgetVersion: U1_OBSERVATION_WIDGET_VERSION,
      cameraWidgetVersion: U1_CAMERA_WIDGET_VERSION,
    },
    checks,
  };
  if (args.json) console.log(JSON.stringify(result));
  else {
    console.log("U1 Print Studio doctor: ok");
    console.log(
      `- runtime contract: ${U1_RUNTIME_VERSION} / tool schema ${U1_TOOL_SCHEMA_VERSION} / ${U1_OBSERVATION_WIDGET_VERSION} / ${U1_CAMERA_WIDGET_VERSION}`
    );
    for (const [name, value] of Object.entries(checks)) {
      console.log(`- ${name}: ${value}`);
    }
  }
}

function help(): void {
  console.log(`U1 Print Studio

Usage:
  u1-print-studio setup [--printer-url URL] [--stun-url URL]... [--config PATH] [--json]
  u1-print-studio doctor [--offline] [--config PATH] [--json]
  u1-print-studio mcp

setup and doctor are shared by Marketplace, Homebrew, and npm packages.
Optional STUN URLs are explicit, bounded, and stored in the owner-only config.
The connector exposes read-only status, snapshot, and bounded live signaling.`);
}

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  const args = parseArguments(argv);
  if (args.command === "setup") return await setup(args);
  if (args.command === "doctor") return await doctor(args);
  if (args.command === "mcp") return await startStdioConnector();
  if (args.command === "help" || args.command === "--help" || args.command === "-h") {
    help();
    return;
  }
  throw new Error(`Unknown command: ${args.command}`);
}

if (import.meta.main) {
  await runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : "U1 Print Studio failed");
    process.exitCode = 1;
  });
}
