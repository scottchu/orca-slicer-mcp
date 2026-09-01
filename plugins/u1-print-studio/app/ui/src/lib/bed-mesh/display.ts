import type { BedMeshObservation } from './types';

export type Point = [number, number, number];
export type ScreenPoint = { x: number; y: number };
export type Sides = { x: number; y: number; z: number };
export type Label = ScreenPoint & { id: string; text: string; width: number; height: number; anchor: ScreenPoint };

/** Padding is a display domain, never an additional measurement. */
export const meshDisplay = (observation: BedMeshObservation) => {
  const { bounds, summary, matrix } = observation;
  const span = Math.max(bounds.xMax - bounds.xMin, bounds.yMax - bounds.yMin);
  const halfX = (bounds.xMax - bounds.xMin) / span / 2;
  const halfY = (bounds.yMax - bounds.yMin) / span / 2;
  const range = Math.max(summary.range, 0.1);
  const step = 10 ** Math.floor(Math.log10(range / 3));
  const low = Math.floor((summary.minimum - range * 0.15) / step) * step;
  const high = Math.ceil((summary.maximum + range * 0.15) / step) * step;
  const height = (value: number) => ((value - low) / (high - low) - 0.5) * 0.36;
  const value = (displayHeight: number) => (displayHeight / 0.36 + 0.5) * (high - low) + low;
  const positions: number[] = [];
  const indices: number[] = [];
  matrix.forEach((row, r) => row.forEach((cell, c) => {
    positions.push(-halfX + c * halfX * 2 / (summary.columns - 1), height(cell), -halfY + r * halfY * 2 / (summary.rows - 1));
    if (r < summary.rows - 1 && c < summary.columns - 1) {
      const a = r * summary.columns + c;
      indices.push(a, a + summary.columns, a + summary.columns + 1, a, a + summary.columns + 1, a + 1);
    }
  }));
  return { halfX, halfY, low, high, height, value, positions, indices };
};
export type Display = ReturnType<typeof meshDisplay>;

export const selectSides = (x: number, y: number, previous?: Sides): Sides => {
  // A 3% dead band prevents wall/edge chatter at cardinal orbit boundaries.
  const side = (value: number, old = 1) => Math.abs(value) < 0.03 ? old : Math.sign(value);
  return { x: side(x, previous?.x), y: side(y, previous?.y), z: previous?.z ?? 0 };
};

export const cageLines = (display: Display, sides: Sides) => {
  const { halfX: x, halfY: y } = display;
  const low = -0.18;
  const high = 0.18;
  const farX = -sides.x * x;
  const farY = -sides.y * y;
  const lines: number[] = [];
  const line = (a: Point, b: Point) => lines.push(...a, ...b);
  for (let tick = 0; tick <= 4; tick += 1) {
    const tx = -x + 2 * x * tick / 4;
    const ty = -y + 2 * y * tick / 4;
    const z = low + (high - low) * tick / 4;
    line([tx, low, -y], [tx, low, y]);
    line([-x, low, ty], [x, low, ty]);
    line([tx, low, farY], [tx, high, farY]);
    line([farX, low, ty], [farX, high, ty]);
    line([-x, z, farY], [x, z, farY]);
    line([farX, z, -y], [farX, z, y]);
  }
  // All four enclosure uprights stay available, including the selected Z edge.
  for (const px of [-x, x]) for (const py of [-y, y]) line([px, low, py], [px, high, py]);
  return lines;
};

export const numberLabel = (value: number) => Number(value.toPrecision(4)).toString();

export const projectedAxes = (display: Display, observation: BedMeshObservation, sides: Sides, project: (point: Point) => ScreenPoint) => {
  const { halfX: x, halfY: y, low, high } = display;
  const candidates: Point[] = [[-sides.x * x, 0, sides.y * y], [sides.x * x, 0, -sides.y * y]];
  const left = project(candidates[0]).x - project(candidates[1]).x;
  const z = Math.abs(left) > 8 ? (left < 0 ? 0 : 1) : sides.z;
  const corner = candidates[z];
  const axes = [
    { id: 'x', a: [-x, -0.18, sides.y * y] as Point, b: [x, -0.18, sides.y * y] as Point, min: observation.bounds.xMin, max: observation.bounds.xMax },
    { id: 'y', a: [sides.x * x, -0.18, -y] as Point, b: [sides.x * x, -0.18, y] as Point, min: observation.bounds.yMin, max: observation.bounds.yMax },
    { id: 'z', a: [corner[0], -0.18, corner[2]] as Point, b: [corner[0], 0.18, corner[2]] as Point, min: low, max: high }
  ];
  return { axes, z };
};

export const layoutLabels = (
  axes: ReturnType<typeof projectedAxes>['axes'], project: (point: Point) => ScreenPoint,
  center: ScreenPoint, measure: (text: string) => { width: number; height: number }, frame: { width: number; height: number }, fit = true
) => {
  const labels: Label[] = [];
  const optional: Label[] = [];
  const overlaps = (label: Label) => labels.some((other) => label.x < other.x + other.width + 3 && label.x + label.width + 3 > other.x && label.y < other.y + other.height + 3 && label.y + label.height + 3 > other.y);
  const contained = (label: Label) => label.x >= 3 && label.y >= 3 && label.x + label.width <= frame.width - 3 && label.y + label.height <= frame.height - 3;
  // Reserve the narrow vertical silhouette first; floor labels can move down
  // without pushing the entire chart away from the Z label column.
  for (const axis of [axes[2], axes[0], axes[1]]) {
    const a = project(axis.a);
    const b = project(axis.b);
    const length = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    let nx = -(b.y - a.y) / length;
    let ny = (b.x - a.x) / length;
    if (nx * ((a.x + b.x) / 2 - center.x) + ny * ((a.y + b.y) / 2 - center.y) < 0) { nx *= -1; ny *= -1; }
    for (const [suffix, part, text] of [['min', 0, numberLabel(axis.min)], ['max', 1, numberLabel(axis.max)], ['', 0.5, axis.id.toUpperCase()]] as const) {
      const anchor = { x: a.x + (b.x - a.x) * part, y: a.y + (b.y - a.y) * part };
      const size = measure(text);
      const distance = 5 + Math.abs(nx) * size.width / 2 + Math.abs(ny) * size.height / 2 + (suffix ? 0 : size.height * 1.2);
      const label = { id: suffix ? `${axis.id}-${suffix}` : axis.id, text, ...size, anchor, x: anchor.x + nx * distance - size.width / 2, y: anchor.y + ny * distance - size.height / 2 };
      if (suffix && axis.id !== 'z') {
        const inset = Math.min(size.width / 2 + 7, length * 0.25) * (part ? -1 : 1);
        label.x += (b.x - a.x) / length * inset;
        label.y += (b.y - a.y) / length * inset;
      }
      if (suffix && axis.id === 'z') label.y += (part ? -1 : 1) * size.height * 0.6;
      // Search along the same projected edge as well as outward. A short Z
      // projection needs vertically separated text, not an ever-wider margin.
      let placed = false;
      for (const distance of [0, 6, 12, 18, 24, 36, 48, 64, 80]) {
        for (const [out, along] of [[0, distance], [0, -distance], [distance, 0], [distance, distance], [distance, -distance]]) {
          const candidate = { ...label, x: label.x + nx * out - ny * along, y: label.y + ny * out + nx * along };
          if (!overlaps(candidate) && (!fit || contained(candidate))) { Object.assign(label, candidate); placed = true; break; }
        }
        if (placed) break;
      }
      if (!placed) for (let attempt = 0; attempt < 32 && overlaps(label); attempt++) { label.x += nx * 6; label.y += ny * 6; }
      labels.push(label);
    }
    if (length > 160) {
      const text = numberLabel((axis.min + axis.max) / 2);
      const size = measure(text);
      const anchor = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const distance = 5 + Math.abs(nx) * size.width / 2 + Math.abs(ny) * size.height / 2;
      const label = { id: `${axis.id}-mid`, text, ...size, anchor, x: anchor.x + nx * distance - size.width / 2, y: anchor.y + ny * distance - size.height / 2 };
      optional.push(label);
    }
  }
  for (const label of optional) if (contained(label) && !overlaps(label)) labels.push(label);
  return labels;
};
