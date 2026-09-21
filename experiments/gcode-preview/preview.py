"""Bounded offline Orca/Klipper planned-toolpath experiment, never a simulator."""
from __future__ import annotations

import argparse
import base64
import gzip
import hashlib
import json
import math
from pathlib import Path
import re

MAX_BYTES = 20_000_000
MAX_VERTICES = 500_000
MAX_DECODED_BYTES = 16_000_000
NUMBER = r"[-+]?(?:\d+(?:\.\d*)?|\.\d+)"
WORDS = re.compile(rf"([A-Z])({NUMBER})")
# These commands do not alter the nominal slicer coordinate interpretation.
PASSIVE = {"M73", "M104", "M109", "M140", "M190", "M106", "M107", "M204", "M400", "SET_VELOCITY_LIMIT", "SET_PRINT_STATS_INFO"}
# Firmware macro bodies are unavailable. Their motion is NOT reconstructed.
OPAQUE = {"TIMELAPSE_TAKE_FRAME", "DEFECT_DETECTION_DETECT"}


class Unsupported(ValueError):
    """Input lies outside this experiment's explicitly supported dialect."""


def parse(raw: bytes) -> dict:
    if len(raw) > MAX_BYTES:
        raise Unsupported("Input exceeds the 20 MB experiment limit")
    text = raw.decode("utf-8")
    xyz = [None, None, None]
    offsets = [0.0, 0.0, 0.0]
    absolute = True
    relative_e = False
    extrusion = 0.0
    extrusion_known = False
    debt = 0.0
    tool = None
    layers, paths = [], []
    layer = -1
    feature = "Unknown"
    opaque = set()
    arc_count = 0
    vertices = 0
    ended = False
    active_path = None
    # Startup establishes modes/tool only: its position is unknowable through macros.
    for line_no, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if stripped == ";LAYER_CHANGE":
            if ended:
                raise Unsupported("Layer after end marker")
            layer += 1
            layers.append({"z": None, "paths": 0})
            active_path = None
            continue
        if stripped.startswith(";Z:") and layer >= 0 and not ended:
            try:
                z = float(stripped[3:])
            except ValueError as exc:
                raise Unsupported("Invalid layer height") from exc
            if not math.isfinite(z) or abs(z) > 10000:
                raise Unsupported("Invalid layer height")
            layers[layer]["z"] = z
            continue
        if stripped.startswith(";TYPE:"):
            # Keep only a closed feature vocabulary, never arbitrary private comments.
            value = stripped[6:].strip()
            feature = value if value in {"Inner wall", "Outer wall", "Sparse infill", "Internal solid infill", "Top surface", "Bottom surface", "Support", "Support interface", "Skirt", "Brim", "Custom", "Prime tower"} else "Other"
            active_path = None
        command = stripped.split(";", 1)[0].strip()
        if not command or ended:
            continue
        opcode = command.split()[0]
        if opcode in {"G20", "G18", "G19", "G90.1", "G91.1"}:
            raise Unsupported(f"Line {line_no}: unsupported coordinate mode {opcode}")
        if opcode == "PRINT_END":
            ended = True
            continue
        if opcode in {"G90", "G91"}:
            absolute = opcode == "G90"
            continue
        if opcode in {"M82", "M83"}:
            relative_e = opcode == "M83"
            continue
        if re.fullmatch(r"T\d+", opcode):
            new_tool = int(opcode[1:])
            if layer >= 0 and new_tool != tool:
                raise Unsupported(f"Line {line_no}: in-layer tool changes are unsupported")
            tool = new_tool
            continue
        if layer < 0:
            continue
        if opcode in PASSIVE:
            continue
        if opcode in OPAQUE:
            opaque.add(opcode)
            continue
        if opcode in {"G17", "G21"}:
            continue
        if opcode not in {"G0", "G1", "G2", "G3", "G92"}:
            raise Unsupported(f"Line {line_no}: unsupported sliced-region command {opcode}")
        arguments = command[len(opcode):].strip()
        matches = list(WORDS.finditer(arguments))
        if WORDS.sub("", arguments).strip():
            raise Unsupported(f"Line {line_no}: malformed or unsupported parameters")
        values = {match[1]: float(match[2]) for match in matches}
        allowed = set("XYZEF") if opcode in {"G0", "G1"} else set("XYZEFIJP") if opcode in {"G2", "G3"} else set("XYZE")
        if len(values) != len(matches) or set(values) - allowed or any(not math.isfinite(v) or abs(v) > 1_000_000 for v in values.values()):
            raise Unsupported(f"Line {line_no}: invalid or unsupported parameters")
        if opcode == "G92":
            if not values:
                raise Unsupported("Bare G92 is unsupported; explicit axes required")
            for axis, name in enumerate("XYZ"):
                if name in values:
                    if xyz[axis] is None:
                        raise Unsupported("Cannot set coordinate offset before known position")
                    offsets[axis] = xyz[axis] - values[name]
            if "E" in values:
                extrusion = values["E"]
                extrusion_known = True
            continue
        previous = xyz.copy()
        for axis, name in enumerate("XYZ"):
            if name in values:
                if not absolute and xyz[axis] is None:
                    raise Unsupported("Relative motion starts from unknown position")
                xyz[axis] = values[name] + offsets[axis] if absolute else xyz[axis] + values[name]
        if not relative_e and "E" in values and not extrusion_known:
            raise Unsupported("Absolute extrusion needs sliced-region G92 E baseline")
        delta = values.get("E", 0.0) if relative_e else values.get("E", extrusion) - extrusion
        extrusion = extrusion + delta if relative_e else values.get("E", extrusion)
        recovered = min(debt, max(delta, 0.0))
        debt = debt - recovered + max(-delta, 0.0)
        deposited = max(0.0, delta - recovered)
        start_fraction = recovered / delta if delta > 0 else 0.0
        if deposited <= 1e-9 or (previous == xyz and opcode not in {"G2", "G3"}):
            active_path = None
            continue
        if None in previous or None in xyz or tool is None:
            raise Unsupported("Deposition starts without known XYZ/tool")
        if layers[layer]["z"] is None:
            raise Unsupported("Deposition has no slicer Z annotation")
        points = []
        if opcode in {"G2", "G3"}:
            if not ({"I", "J"} & values.keys()) or values.get("P", 1) != 1:
                raise Unsupported("Only one-turn incremental I/J XY arcs are supported")
            center = [previous[0] + values.get("I", 0), previous[1] + values.get("J", 0)]
            radius = math.hypot(previous[0] - center[0], previous[1] - center[1])
            end_radius = math.hypot(xyz[0] - center[0], xyz[1] - center[1])
            if radius <= 0 or abs(radius - end_radius) > 0.02:
                raise Unsupported("Inconsistent XY arc radius")
            start = math.atan2(previous[1] - center[1], previous[0] - center[0])
            end = math.atan2(xyz[1] - center[1], xyz[0] - center[0])
            sweep = (end - start) % math.tau if opcode == "G3" else -((start - end) % math.tau)
            if abs(sweep) < 1e-10:
                sweep = math.tau if opcode == "G3" else -math.tau
            # Maximum chord error 0.02 mm, maximum angular step 10 degrees.
            step = min(math.pi / 18, 2 * math.acos(max(-1, 1 - 0.02 / radius)))
            count = math.ceil(abs(sweep) / step)
            if count > MAX_VERTICES:
                raise Unsupported("Arc exceeds vertex budget")
            fractions = [start_fraction] + [i / count for i in range(1, count + 1) if i / count > start_fraction]
            points = [[center[0] + radius * math.cos(start + sweep * f), center[1] + radius * math.sin(start + sweep * f), previous[2] + (xyz[2] - previous[2]) * f] for f in fractions]
            points[-1] = xyz.copy()
            arc_count += 1
        else:
            points = [[a + (b - a) * start_fraction for a, b in zip(previous, xyz)], xyz.copy()]
        points = [[round(v, 5) for v in point] for point in points]
        if active_path is not None and active_path["points"][-1] == points[0]:
            active_path["points"].extend(points[1:])
        else:
            active_path = {"layer": layer, "tool": tool, "feature": feature, "points": points}
            paths.append(active_path)
            layers[layer]["paths"] += 1
        vertices += len(points)
        if vertices > MAX_VERTICES:
            raise Unsupported("Preview exceeds vertex budget")
    if not paths or any(item["z"] is None for item in layers):
        raise Unsupported("No complete annotated layer geometry")
    bounds = [[min(p[i] for path in paths for p in path["points"]), max(p[i] for path in paths for p in path["points"])] for i in range(3)]
    return {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw), "layers": layers, "paths": paths, "bounds": bounds, "opaqueMacros": sorted(opaque), "depositionArcs": arc_count, "vertices": sum(len(p["points"]) for p in paths)}


def pack(data: dict) -> dict:
    """Losslessly encode the already-normalized 1e-5 mm path coordinates."""
    compact = {key: value for key, value in data.items() if key != "paths"}
    compact["paths"] = []
    for path in data["paths"]:
        previous = [0, 0, 0]
        deltas = []
        for point in path["points"]:
            current = [round(value * 100_000) for value in point]
            if any(abs(value) > 9_007_199_254_740_991 or abs(value - old) > 9_007_199_254_740_991 for value, old in zip(current, previous)):
                raise Unsupported("Coordinate exceeds safe integer delta range")
            if any(value / 100_000 != original for value, original in zip(current, point)):
                raise Unsupported("Coordinate cannot round-trip at parser precision")
            deltas.extend(value - old for value, old in zip(current, previous))
            previous = current
        compact["paths"].append({**{key: value for key, value in path.items() if key != "points"}, "d": deltas})
    expanded = json.dumps(compact, separators=(",", ":")).encode()
    if len(expanded) > MAX_DECODED_BYTES:
        raise Unsupported("Decoded geometry exceeds 16,000,000 bytes")
    return {"encoding": "gzip-delta-1e5-v1", "decodedBytes": len(expanded), "body": base64.b64encode(gzip.compress(expanded, mtime=0)).decode("ascii")}


def generate(source: Path, output: Path) -> dict:
    with source.open("rb") as stream:
        data = parse(stream.read(MAX_BYTES + 1))
    template = Path(__file__).with_name("preview.html").read_text()
    fragment = template.replace("__TOOLPATH_DATA__", json.dumps(pack(data), separators=(",", ":")))
    if len(fragment.encode()) >= 1_000_000:
        raise Unsupported("Inline preview exceeds 1 MB")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(fragment)
    wrapper = Path(__file__).with_name("standalone.html").read_text()
    output.with_name(output.stem + "-standalone.html").write_text(wrapper.replace("__FRAGMENT__", fragment))
    return {key: value for key, value in data.items() if key != "paths"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    print(json.dumps(generate(args.source, args.output), indent=2))
