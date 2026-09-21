import { gzipSync } from 'node:zlib';
import { TOOLPATH_VERSION, TOOLPATH_MAX_BYTES, TOOLPATH_MAX_VERTICES, TOOLPATH_MAX_DECODED, TOOLPATH_MAX_ENCODED, type ToolpathGeometry, type EncodedToolpath } from '../../toolpath.js';

export class ToolpathError extends Error {
  constructor(readonly reason: 'unsupported_gcode' | 'too_large' | 'timeout') { super(reason); }
}
const unsupported = (): never => { throw new ToolpathError('unsupported_gcode'); };
const budget = (ok: boolean) => { if (!ok) throw new ToolpathError('too_large'); };
const passive = new Set(['M73', 'M104', 'M109', 'M140', 'M190', 'M106', 'M107', 'M204', 'M400', 'SET_VELOCITY_LIMIT']);
const opaque = new Set(['TIMELAPSE_TAKE_FRAME', 'DEFECT_DETECTION_DETECT']);
const words = /([A-Z])([-+]?(?:\d+(?:\.\d*)?|\.\d+))/g;
type Point = [number, number, number];
type Path = { layer: number; tool: number; points: Point[] };

/** Nominal deposited centerlines, never firmware macro execution or bead volume. */
export const parseToolpath = (raw: Uint8Array, deadline = performance.now() + 20_000): ToolpathGeometry => {
  const checkTime = () => { if (performance.now() >= deadline) throw new ToolpathError('timeout'); };
  checkTime();
  budget(raw.byteLength <= TOOLPATH_MAX_BYTES);
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(raw); } catch { return unsupported(); }
  let xyz: Array<number | null> = [null, null, null], offsets = [0, 0, 0];
  let absolute = true, relativeE = false, tool: number | null = null, layer = -1, ended = false;
  let vertices = 0, opaqueMacros = false, active: Path | null = null, mappingValid = true, declaredTotal: number | null = null;
  const extruders = Array.from({ length: 4 }, () => ({ e: 0, known: false, debt: 0 }));
  const layers: ToolpathGeometry['layers'] = [], paths: Path[] = [], depositedLayers = new Set<number>();
  for (const line of text.split(/\r?\n/)) {
    checkTime();
    budget(line.length <= 100_000);
    const stripped = line.trim();
    if (stripped === ';LAYER_CHANGE') {
      if (ended) unsupported();
      layers.push({ z: NaN, reported: null }); layer++; active = null; budget(layers.length <= 20_000); continue;
    }
    if (stripped.startsWith(';Z:') && layer >= 0 && !ended) {
      const z = Number(stripped.slice(3)); if (!Number.isFinite(z) || Math.abs(z) > 10_000) unsupported();
      layers[layer]!.z = z; continue;
    }
    if (stripped.startsWith(';TYPE:')) active = null;
    const command = stripped.split(';', 1)[0]!.trim();
    if (!command || ended) continue;
    const opcode = command.split(/\s/, 1)[0]!;
    if (['G20', 'G18', 'G19', 'G90.1', 'G91.1'].includes(opcode)) unsupported();
    if (opcode === 'PRINT_END') { ended = true; continue; }
    if (opcode === 'G90' || opcode === 'G91') { absolute = opcode === 'G90'; continue; }
    if (opcode === 'M82' || opcode === 'M83') { relativeE = opcode === 'M83'; continue; }
    if (/^T\d+$/.test(opcode)) {
      const next = Number(opcode.slice(1)); if (next > 3) unsupported();
      if (layer >= 0) {
        if (offsets.some(value => value !== 0)) unsupported();
        // Firmware tool-change motion is unknown. Require explicit positioning
        // and a fresh absolute-extrusion baseline before the new tool deposits.
        xyz = [null, null, null]; offsets = [0, 0, 0]; extruders[next]!.known = false; active = null;
      }
      tool = next; continue;
    }
    if (opcode === 'SET_PRINT_STATS_INFO') {
      const parameters = command.slice(opcode.length).trim().split(/\s+/);
      if (parameters.some(p => !/^(TOTAL_LAYER|CURRENT_LAYER)=\d+$/.test(p)) || new Set(parameters.map(p => p.split('=')[0])).size !== parameters.length) mappingValid = false;
      const total = /(?:^|\s)TOTAL_LAYER=(\d+)(?:\s|$)/.exec(command);
      const current = /(?:^|\s)CURRENT_LAYER=(\d+)(?:\s|$)/.exec(command);
      if (total) { const value = Number(total[1]); if (declaredTotal !== null && declaredTotal !== value) mappingValid = false; declaredTotal = value; }
      if (current && layer >= 0) {
        const value = Number(current[1]);
        if (layers[layer]!.reported !== null || depositedLayers.has(layer) || value !== layer + 1) mappingValid = false;
        layers[layer]!.reported = value;
      }
      continue;
    }
    if (layer < 0) {
      if ((opcode === 'G92' && /[XYZ]/.test(command.slice(3))) || ['SET_GCODE_OFFSET', 'SET_KINEMATIC_POSITION', 'G10', 'G28.1', 'G92.1'].includes(opcode)) unsupported();
      continue;
    }
    if (passive.has(opcode) || opcode === 'G17' || opcode === 'G21') continue;
    if (opaque.has(opcode)) { opaqueMacros = true; active = null; continue; }
    if (!['G0', 'G1', 'G2', 'G3', 'G92'].includes(opcode)) unsupported();
    const args = command.slice(opcode.length).trim(), matches = [...args.matchAll(words)];
    if (args.replace(words, '').trim()) unsupported();
    const values = Object.fromEntries(matches.map(m => [m[1]!, Number(m[2])]));
    const allowed = opcode === 'G92' ? 'XYZE' : ['G2', 'G3'].includes(opcode) ? 'XYZEFIJP' : 'XYZEF';
    if (matches.length !== Object.keys(values).length || Object.entries(values).some(([k, v]) => !allowed.includes(k) || !Number.isFinite(v) || Math.abs(v) > 1_000_000)) unsupported();
    if (tool === null && 'E' in values) unsupported();
    const extrusion = extruders[tool ?? 0]!;
    if (opcode === 'G92') {
      if (!Object.keys(values).length) unsupported();
      for (const [i, axis] of ['X', 'Y', 'Z'].entries()) if (axis in values) { if (xyz[i] === null) unsupported(); offsets[i] = xyz[i]! - values[axis]!; }
      if ('E' in values) { extrusion.e = values.E!; extrusion.known = true; }
      continue;
    }
    const previous = [...xyz];
    for (const [i, axis] of ['X', 'Y', 'Z'].entries()) if (axis in values) {
      if (!absolute && xyz[i] === null) unsupported();
      xyz[i] = absolute ? values[axis]! + offsets[i]! : xyz[i]! + values[axis]!;
      if (Math.abs(xyz[i]!) > 10_000) unsupported();
    }
    if (!relativeE && 'E' in values && !extrusion.known) unsupported();
    const delta = relativeE ? values.E ?? 0 : (values.E ?? extrusion.e) - extrusion.e;
    extrusion.e = relativeE ? extrusion.e + delta : values.E ?? extrusion.e;
    const recovered = Math.min(extrusion.debt, Math.max(delta, 0));
    extrusion.debt = extrusion.debt - recovered + Math.max(-delta, 0);
    if (delta - recovered <= 1e-9 || (previous.every((v, i) => v === xyz[i]) && !['G2', 'G3'].includes(opcode))) { active = null; continue; }
    if (previous.includes(null) || xyz.includes(null) || tool === null || !Number.isFinite(layers[layer]!.z)) unsupported();
    const from = previous as Point, to = xyz as Point, fraction = recovered / delta;
    let points: Point[];
    if (opcode === 'G2' || opcode === 'G3') {
      if ((!('I' in values) && !('J' in values)) || (values.P ?? 1) !== 1) unsupported();
      const center = [from[0] + (values.I ?? 0), from[1] + (values.J ?? 0)];
      const radius = Math.hypot(from[0] - center[0]!, from[1] - center[1]!);
      if (radius <= 0 || Math.abs(radius - Math.hypot(to[0] - center[0]!, to[1] - center[1]!)) > .02) unsupported();
      const start = Math.atan2(from[1] - center[1]!, from[0] - center[0]!), end = Math.atan2(to[1] - center[1]!, to[0] - center[0]!);
      const tau = Math.PI * 2;
      let sweep = opcode === 'G3' ? ((end - start) % tau + tau) % tau : -(((start - end) % tau + tau) % tau);
      if (Math.abs(sweep) < 1e-10) sweep = opcode === 'G3' ? tau : -tau;
      const count = Math.ceil(Math.abs(sweep) / Math.min(Math.PI / 18, 2 * Math.acos(Math.max(-1, 1 - .02 / radius))));
      budget(count + vertices <= TOOLPATH_MAX_VERTICES);
      const fractions = [fraction, ...Array.from({ length: count }, (_, i) => (i + 1) / count).filter(v => v > fraction)];
      points = fractions.map(f => [center[0]! + radius * Math.cos(start + sweep * f), center[1]! + radius * Math.sin(start + sweep * f), from[2] + (to[2] - from[2]) * f]);
      points[points.length - 1] = [...to];
    } else points = [from.map((v, i) => v + (to[i]! - v) * fraction) as Point, [...to]];
    points = points.map(point => point.map(v => Math.round(v * 100_000) / 100_000) as Point);
    if (active && active.points.at(-1)!.every((v, i) => v === points[0]![i])) active.points.push(...points.slice(1));
    else { active = { layer, tool: tool!, points }; paths.push(active); }
    depositedLayers.add(layer);
    vertices += points.length; budget(vertices <= TOOLPATH_MAX_VERTICES);
  }
  if (!paths.length || layers.some(l => !Number.isFinite(l.z))) unsupported();
  if (declaredTotal !== layers.length || !mappingValid || layers.some((l, i) => l.reported !== i + 1)) layers.forEach(l => { l.reported = null; });
  const bounds: Array<[number, number]> = [[Infinity, -Infinity], [Infinity, -Infinity], [Infinity, -Infinity]];
  let storedVertices = 0;
  const packed = paths.map(path => {
    let previous = [0, 0, 0]; const d: number[] = [];
    for (const point of path.points) {
      checkTime();
      const next = point.map(v => Math.round(v * 100_000));
      point.forEach((v, i) => { bounds[i]![0] = Math.min(bounds[i]![0], v); bounds[i]![1] = Math.max(bounds[i]![1], v); d.push(next[i]! - previous[i]!); });
      previous = next; storedVertices++;
    }
    return { layer: path.layer, tool: path.tool, d };
  });
  return { version: TOOLPATH_VERSION, layers, paths: packed, bounds, vertices: storedVertices, opaqueMacros };
};

export const compileToolpath = (bytes: Uint8Array, deadline = performance.now() + 20_000): { geometry: ToolpathGeometry; encoded: EncodedToolpath } => {
  const geometry = parseToolpath(bytes, deadline), json = Buffer.from(JSON.stringify(geometry));
  if (performance.now() >= deadline) throw new ToolpathError('timeout');
  budget(json.byteLength <= TOOLPATH_MAX_DECODED);
  const encoded: EncodedToolpath = { encoding: 'gzip-delta-1e5-v1', decodedBytes: json.byteLength, body: gzipSync(json, { level: 9 }).toString('base64') };
  if (performance.now() >= deadline) throw new ToolpathError('timeout');
  budget(Buffer.byteLength(JSON.stringify(encoded)) < TOOLPATH_MAX_ENCODED);
  return { geometry, encoded };
};
