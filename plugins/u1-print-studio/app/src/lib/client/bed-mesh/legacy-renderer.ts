import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// The observation widget is a self-contained MCP resource. This entry point is
// bundled into public/widget.html at build time; it must never become a runtime
// import or network request.
(globalThis as typeof globalThis & {
  U1BedMeshThree?: Readonly<{ THREE: typeof THREE; OrbitControls: typeof OrbitControls }>;
}).U1BedMeshThree = Object.freeze({ THREE, OrbitControls });
