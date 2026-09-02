import { deflateSync } from "node:zlib";

import type { U1Status } from "./u1-status.js";

const WIDTH = 1200;
const HEIGHT = 1500;

type Color = readonly [number, number, number, number];

const COLORS = {
  background: [243, 248, 245, 255] as Color,
  panel: [255, 255, 255, 255] as Color,
  ink: [13, 36, 29, 255] as Color,
  muted: [94, 113, 106, 255] as Color,
  border: [214, 227, 220, 255] as Color,
  forest: [8, 91, 68, 255] as Color,
  green: [29, 191, 132, 255] as Color,
  lime: [167, 243, 55, 255] as Color,
  warning: [227, 164, 38, 255] as Color,
  danger: [201, 66, 58, 255] as Color,
  white: [255, 255, 255, 255] as Color,
};

// A compact, dependency-free bitmap alphabet keeps remote rendering portable.
// Each glyph is five pixels wide and seven pixels tall.
const GLYPHS: Record<string, readonly string[]> = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
  ":": ["00000", "00110", "00110", "00000", "00110", "00110", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
  "%": ["11001", "11010", "00100", "01000", "10110", "00110", "00000"],
  "|": ["00100", "00100", "00100", "00100", "00100", "00100", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
};

function setPixel(
  pixels: Uint8Array,
  x: number,
  y: number,
  color: Color
): void {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const offset = (y * WIDTH + x) * 4;
  pixels.set(color, offset);
}

function rectangle(
  pixels: Uint8Array,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Color
): void {
  for (let row = Math.max(0, y); row < Math.min(HEIGHT, y + height); row += 1) {
    for (let column = Math.max(0, x); column < Math.min(WIDTH, x + width); column += 1) {
      setPixel(pixels, column, row, color);
    }
  }
}

function circle(
  pixels: Uint8Array,
  centerX: number,
  centerY: number,
  radius: number,
  color: Color
): void {
  const radiusSquared = radius * radius;
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y <= radiusSquared) {
        setPixel(pixels, centerX + x, centerY + y, color);
      }
    }
  }
}

function textWidth(value: string, scale: number): number {
  return Math.max(0, value.length * 6 * scale - scale);
}

function text(
  pixels: Uint8Array,
  value: string,
  x: number,
  y: number,
  scale: number,
  color: Color
): void {
  let cursor = x;
  for (const rawCharacter of value.toUpperCase()) {
    const glyph = GLYPHS[rawCharacter] ?? GLYPHS["?"];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < glyph[row].length; column += 1) {
        if (glyph[row][column] === "1") {
          rectangle(
            pixels,
            cursor + column * scale,
            y + row * scale,
            scale,
            scale,
            color
          );
        }
      }
    }
    cursor += 6 * scale;
  }
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function encodePng(pixels: Uint8Array): Buffer {
  const stride = WIDTH * 4;
  const raw = Buffer.alloc((stride + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const destination = y * (stride + 1);
    raw[destination] = 0;
    raw.set(pixels.subarray(y * stride, (y + 1) * stride), destination + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function duration(seconds: number | null): string {
  if (seconds === null) return "UNKNOWN";
  if (seconds < 60) return `${Math.max(0, Math.round(seconds))}S`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}M`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}H ${remainder}M` : `${hours}H`;
}

function safeFilename(filename: string | null): string {
  const value = (filename ?? "NO ACTIVE FILE")
    .replace(/[^a-zA-Z0-9._ -]/g, "?")
    .trim();
  const safe = value || "NO ACTIVE FILE";
  if (safe.length <= 36) return safe;
  return `${safe.slice(0, 24)}...${safe.slice(-9)}`;
}

function observedTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "UNKNOWN";
  return date.toISOString().slice(11, 19) + " UTC";
}

function stateColor(status: U1Status): Color {
  if (!status.reachable || status.exception || status.state === "error") {
    return COLORS.danger;
  }
  if (status.state === "paused" || status.state === "cancelled") {
    return COLORS.warning;
  }
  return COLORS.green;
}

function metricCard(
  pixels: Uint8Array,
  x: number,
  y: number,
  label: string,
  primary: string,
  secondary: string
): void {
  rectangle(pixels, x, y, 520, 255, COLORS.panel);
  rectangle(pixels, x, y, 520, 4, COLORS.border);
  text(pixels, label, x + 32, y + 35, 4, COLORS.muted);
  text(pixels, primary, x + 32, y + 102, 8, COLORS.ink);
  text(pixels, secondary, x + 32, y + 204, 4, COLORS.muted);
}

export function renderStatusCardPng(status: U1Status): Buffer {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
  rectangle(pixels, 0, 0, WIDTH, HEIGHT, COLORS.background);
  rectangle(pixels, 0, 0, WIDTH, 420, COLORS.forest);

  text(pixels, "SNAPMAKER U1 | READ ONLY", 56, 60, 5, COLORS.lime);
  circle(pixels, 1118, 79, 18, status.reachable ? COLORS.green : COLORS.danger);

  const state = status.stateLabel.slice(0, 14).toUpperCase();
  text(pixels, state, 56, 160, 10, COLORS.white);
  const progress = status.progressPercent === null
    ? "UNKNOWN"
    : `${Math.round(status.progressPercent)}%`;
  text(
    pixels,
    progress,
    WIDTH - 56 - textWidth(progress, 10),
    160,
    10,
    COLORS.white
  );

  rectangle(pixels, 56, 342, WIDTH - 112, 26, [41, 116, 94, 255]);
  rectangle(
    pixels,
    56,
    342,
    status.progressPercent === null
      ? 0
      : Math.round(
          (WIDTH - 112) *
            Math.min(100, Math.max(0, status.progressPercent)) / 100
        ),
    26,
    stateColor(status)
  );

  const activeTool = status.activePhysicalTool === null
    ? "PARKED"
    : `TOOL ${status.activePhysicalTool}`;
  const activeToolReading = status.tools.find((tool) => tool.active) ?? status.tools[0];
  const toolTemperatures = activeToolReading &&
      activeToolReading.temperature !== null &&
      activeToolReading.target !== null
    ? `${Math.round(activeToolReading.temperature)}C / ${Math.round(activeToolReading.target)}C`
    : "NO READING";
  const layer = status.currentLayer === null
    ? "UNKNOWN"
    : status.totalLayers === null
      ? String(status.currentLayer)
      : `${status.currentLayer} / ${status.totalLayers}`;
  const timePrimary = status.state === "complete"
    ? duration(status.elapsedSeconds)
    : duration(status.remainingSeconds);
  const timeSecondary = status.state === "complete" ? "ELAPSED" : "REMAINING";

  metricCard(pixels, 56, 485, "TOOL", activeTool, toolTemperatures);
  metricCard(
    pixels,
    624,
    485,
    "BED",
    status.bed.temperature === null
      ? "UNAVAILABLE"
      : `${Math.round(status.bed.temperature)}C`,
    status.bed.target === null
      ? "TARGET UNKNOWN"
      : `TARGET ${Math.round(status.bed.target)}C`
  );
  metricCard(pixels, 56, 780, "TIME", timePrimary, timeSecondary);
  metricCard(
    pixels,
    624,
    780,
    "LAYER",
    layer,
    status.storage.active ? "STORAGE ACTIVE" : "STORAGE IDLE"
  );

  text(pixels, "FILE", 56, 1095, 4, COLORS.muted);
  text(pixels, safeFilename(status.filename), 56, 1160, 5, COLORS.ink);

  rectangle(pixels, 56, 1280, WIDTH - 112, 3, COLORS.border);
  const camera = status.camera.available ? "CAMERA READY" : "CAMERA UNAVAILABLE";
  text(
    pixels,
    `OBSERVED ${observedTime(status.observedAt)} | ${camera}`,
    56,
    1325,
    4,
    COLORS.muted
  );
  const refresh = `FRESH SNAPSHOT | NEXT CHECK ${status.refreshAfterSeconds}S`;
  text(
    pixels,
    refresh,
    WIDTH - 56 - textWidth(refresh, 4),
    1410,
    4,
    COLORS.forest
  );

  return encodePng(pixels);
}

export function statusCardImageContent(status: U1Status) {
  return {
    type: "image" as const,
    data: renderStatusCardPng(status).toString("base64"),
    mimeType: "image/png",
  };
}
