<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { meshColor } from './palette';
  import type { BedMeshObservation } from './types';

  let { observation, resetKey = 0 }: { observation: BedMeshObservation; resetKey?: number } = $props();
  let host: HTMLDivElement;
  let resetView: (() => void) | undefined;
  let projection = $state<{ left: number; top: number; width: number; height: number } | null>(null);
  $effect(() => { resetKey; resetView?.(); });

  const boundLabel = (value: number) => Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);

  onMount(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xffffff, 0);
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    const bounds = observation.bounds;
    const xSpan = bounds.xMax - bounds.xMin;
    const ySpan = bounds.yMax - bounds.yMin;
    const xySpan = Math.max(xSpan, ySpan);
    const displayScale = observation.summary.range > 0 ? Math.max(1, Math.min(300, (0.2 * xySpan) / observation.summary.range)) : 1;
    const centerHeight = (observation.summary.minimum + observation.summary.maximum) / 2;
    const positions: number[] = [];
    const colors: number[] = [];
    for (let row = 0; row < observation.summary.rows; row += 1) {
      for (let column = 0; column < observation.summary.columns; column += 1) {
        const x = bounds.xMin + (xSpan * column) / (observation.summary.columns - 1);
        const z = bounds.yMin + (ySpan * row) / (observation.summary.rows - 1);
        const value = observation.matrix[row][column];
        positions.push(x, (value - centerHeight) * displayScale, z);
        const color = new THREE.Color(meshColor(value, observation.summary.minimum, observation.summary.range));
        colors.push(color.r, color.g, color.b);
      }
    }
    const indices: number[] = [];
    for (let row = 0; row < observation.summary.rows - 1; row += 1) {
      for (let column = 0; column < observation.summary.columns - 1; column += 1) {
        const a = row * observation.summary.columns + column;
        const b = a + 1;
        const c = a + observation.summary.columns;
        const d = c + 1;
        indices.push(a, c, d, a, d, b);
      }
    }
    const surfaceGeometry = new THREE.BufferGeometry();
    surfaceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    surfaceGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    surfaceGeometry.setIndex(indices);
    surfaceGeometry.computeVertexNormals();
    const surfaceMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, metalness: 0, side: THREE.DoubleSide });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    scene.add(surface);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd3da, 2.2));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight.position.set(xySpan, xySpan * 1.5, xySpan);
    scene.add(directionalLight);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x525d68, transparent: true, opacity: 0.28 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(surfaceGeometry, 8), edgeMaterial);
    scene.add(edges);

    const line = (points: number[], color = 0xcfd4d9, opacity = 0.72) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      const item = new THREE.LineSegments(geometry, material);
      scene.add(item);
      return [geometry, material] as const;
    };
    const disposables: Array<{ dispose(): void }> = [surfaceGeometry, surfaceMaterial, edgeMaterial, edges.geometry];
    const zLow = (observation.summary.minimum - centerHeight) * displayScale;
    const zHigh = (observation.summary.maximum - centerHeight) * displayScale;
    for (let tick = 0; tick <= 4; tick += 1) {
      const height = zLow + ((zHigh - zLow) * tick) / 4;
      const [geometry, material] = line([
        bounds.xMin, height, bounds.yMin, bounds.xMax, height, bounds.yMin,
        bounds.xMax, height, bounds.yMin, bounds.xMax, height, bounds.yMax,
        bounds.xMax, height, bounds.yMax, bounds.xMin, height, bounds.yMax,
        bounds.xMin, height, bounds.yMax, bounds.xMin, height, bounds.yMin
      ], 0xd3d9de, 0.74);
      disposables.push(geometry, material);
    }
    for (let tick = 0; tick <= 4; tick += 1) {
      const x = bounds.xMin + (xSpan * tick) / 4;
      const y = bounds.yMin + (ySpan * tick) / 4;
      const [geometry, material] = line([
        x, zLow, bounds.yMin, x, zLow, bounds.yMax,
        bounds.xMin, zLow, y, bounds.xMax, zLow, y
      ], 0xd8dde2, 0.68);
      disposables.push(geometry, material);
    }
    const [axisGeometry, axisMaterial] = line([
      bounds.xMin, zLow, bounds.yMin, bounds.xMax, zLow, bounds.yMin,
      bounds.xMin, zLow, bounds.yMin, bounds.xMin, zLow, bounds.yMax,
      bounds.xMin, zLow, bounds.yMin, bounds.xMin, zHigh, bounds.yMin
    ], 0x69717a, 0.92);
    disposables.push(axisGeometry, axisMaterial);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, xySpan * 20 + 10);
    const target = new THREE.Vector3((bounds.xMin + bounds.xMax) / 2, 0, (bounds.yMin + bounds.yMax) / 2);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minPolarAngle = THREE.MathUtils.degToRad(18);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(74);
    controls.minZoom = 0.75;
    controls.maxZoom = 3.5;
    const initialOffset = new THREE.Vector3(xySpan * 0.92, xySpan * 0.78, xySpan * 1.04);
    resetView = () => {
      camera.position.copy(target).add(initialOffset);
      camera.zoom = 1;
      controls.target.copy(target);
      camera.updateProjectionMatrix();
      controls.update();
      render();
    };
    const updateProjection = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      camera.updateMatrixWorld(true);
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      const point = new THREE.Vector3();
      for (let index = 0; index < positions.length; index += 3) {
        point.set(positions[index], positions[index + 1], positions[index + 2]).project(camera);
        const x = (point.x * 0.5 + 0.5) * rect.width;
        const y = (-point.y * 0.5 + 0.5) * rect.height;
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
      projection = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
    };
    const render = () => {
      renderer.render(scene, camera);
      updateProjection();
    };
    controls.addEventListener('change', render);
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const aspect = Math.max(0.1, rect.width / Math.max(1, rect.height));
      const view = xySpan * 0.57;
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resetView();
    resize();
    return () => {
      observer.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      resetView = undefined;
    };
  });
</script>

<div class="three-host" bind:this={host} data-bed-mesh-3d>
  {#if projection}
    <div
      class="surface-projection"
      data-surface-projection
      data-ready="true"
      style={`left:${projection.left}px;top:${projection.top}px;width:${projection.width}px;height:${projection.height}px`}
      aria-hidden="true"
    ></div>
  {/if}
  <div class="axis-label z-title" data-axis-label data-axis="z" aria-hidden="true">Z · mm</div>
  <div class="axis-label z-max" data-axis-label data-axis="z-max" aria-hidden="true">{observation.summary.maximum.toFixed(3)}</div>
  <div class="axis-label z-min" data-axis-label data-axis="z-min" aria-hidden="true">{observation.summary.minimum.toFixed(3)}</div>
  <div class="axis-label y-title" data-axis-label data-axis="y" aria-hidden="true">Y · mm</div>
  <div class="axis-label y-max" data-axis-label data-axis="y-max" aria-hidden="true">{boundLabel(observation.bounds.yMax)}</div>
  <div class="axis-label y-min" data-axis-label data-axis="y-min" aria-hidden="true">{boundLabel(observation.bounds.yMin)}</div>
  <div class="axis-label x-title" data-axis-label data-axis="x" aria-hidden="true">X · mm</div>
  <div class="axis-label x-min" data-axis-label data-axis="x-min" aria-hidden="true">{boundLabel(observation.bounds.xMin)}</div>
  <div class="axis-label x-max" data-axis-label data-axis="x-max" aria-hidden="true">{boundLabel(observation.bounds.xMax)}</div>
</div>

<style>
  .three-host { position: relative; width: 100%; height: 100%; overflow: hidden; }
  .three-host :global(canvas) { position: absolute; inset: 0; z-index: 0; display: block; }
  .surface-projection { position: absolute; z-index: 1; pointer-events: none; opacity: 0; }
  .axis-label {
    position: absolute;
    z-index: 2;
    padding: 2px 4px;
    border-radius: 5px;
    background: rgb(255 255 255 / 78%);
    color: #59636d;
    font: 600 12px/1.2 var(--u1-font);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    pointer-events: none;
  }
  .z-title { top: 8px; left: 8px; color: #2f3942; }
  .z-max { top: 31px; left: 8px; }
  .z-min { bottom: 31px; left: 8px; }
  .y-title { top: 8px; right: 8px; color: #2f3942; }
  .y-max { top: 31px; right: 8px; }
  .y-min { right: 8px; bottom: 31px; }
  .x-title { bottom: 7px; left: 50%; color: #2f3942; transform: translateX(-50%); }
  .x-min { bottom: 7px; left: 8px; }
  .x-max { right: 8px; bottom: 7px; }
</style>
