<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { cageLines, layoutLabels, meshDisplay, projectedAxes, selectSides, type Label, type Point, type Sides } from './display';
  import { meshColor } from './palette';
  import type { BedMeshObservation } from './types';

  let { observation, resetKey = 0 }: { observation: BedMeshObservation; resetKey?: number } = $props();
  let host: HTMLDivElement;
  let resetView: (() => void) | undefined;
  let updateData: ((next: BedMeshObservation) => void) | undefined;
  let previousReset = 0;
  let labels = $state<Label[]>([]);
  let projection = $state<{ left: number; top: number; width: number; height: number } | null>(null);
  $effect(() => { const next = observation; untrack(() => updateData?.(next)); });
  $effect(() => { const key = resetKey; untrack(() => { if (key !== previousReset) { previousReset = key; resetView?.(); } }); });

  onMount(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xffffff, 0);
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minPolarAngle = THREE.MathUtils.degToRad(18);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(74);
    controls.minZoom = 0.75;
    controls.maxZoom = 3.5;
    const surfaceMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, metalness: 0, side: THREE.DoubleSide });
    const surface = new THREE.Mesh(new THREE.BufferGeometry(), surfaceMaterial);
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x9ba7b1, transparent: true, opacity: 0.55 });
    const grid = new THREE.LineSegments(new THREE.BufferGeometry(), gridMaterial);
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x59636d, transparent: true, opacity: 0.9 });
    const axes = new THREE.LineSegments(new THREE.BufferGeometry(), axisMaterial);
    scene.add(surface, grid, axes, new THREE.HemisphereLight(0xffffff, 0xcbd3da, 2.2));
    const light = new THREE.DirectionalLight(0xffffff, 1.4);
    light.position.set(1, 1.5, 1);
    scene.add(light);
    let data = observation;
    let display = meshDisplay(data);
    let sides: Sides = { x: 1, y: 1, z: 0 };
    let gridKey = '';
    const point = new THREE.Vector3();
    const measurement = document.createElement('canvas').getContext('2d')!;
    const geometry = (positions: number[]) => {
      const result = new THREE.BufferGeometry();
      result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      return result;
    };
    const replace = (item: THREE.Mesh | THREE.LineSegments, next: THREE.BufferGeometry) => {
      item.geometry.dispose();
      item.geometry = next;
    };
    const render = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const project = (position: Point) => {
        point.set(...position).project(camera);
        return { x: (point.x + 1) * rect.width / 2, y: (1 - point.y) * rect.height / 2 };
      };
      camera.updateMatrixWorld(true);
      sides = selectSides(camera.position.x, camera.position.z, sides);
      const nextGridKey = `${sides.x},${sides.y}`;
      if (nextGridKey !== gridKey) { replace(grid, geometry(cageLines(display, sides))); gridKey = nextGridKey; }
      measurement.font = getComputedStyle(host).font;
      const fontSize = Number.parseFloat(getComputedStyle(host).fontSize);
      const digit = Math.max(...'0123456789'.split('').map((value) => measurement.measureText(value).width));
      const measure = (text: string) => ({ width: Math.ceil(Math.max(measurement.measureText(text).width, [...text].reduce((sum, value) => sum + (/\d/.test(value) ? digit : measurement.measureText(value).width), 0))) + 4, height: Math.ceil(fontSize * 1.2) + 2 });
      const aspect = rect.width / rect.height;
      // Fit is an overview calculation. OrbitControls owns the independent
      // detail zoom; including it in the fit would cancel wheel/pinch input.
      const zoom = camera.zoom;
      camera.zoom = 1;
      let view = 0.48;
      let shiftX = 0;
      let shiftY = 0;
      let nextLabels: Label[] = [];
      let selected = projectedAxes(display, data, sides, project);
      // Fit the actual enclosure and measured labels, not a fixed CSS margin.
      // The user's orbit stays intact; only the orthographic frustum changes.
      for (let attempt = 0; attempt < 24; attempt += 1) {
        camera.left = -view * aspect + shiftX;
        camera.right = view * aspect + shiftX;
        camera.top = view + shiftY;
        camera.bottom = -view + shiftY;
        camera.updateProjectionMatrix();
        selected = projectedAxes(display, data, sides, project);
        sides.z = selected.z;
        nextLabels = layoutLabels(selected.axes, project, project([0, 0, 0]), measure, rect);
        const corners = [-display.halfX, display.halfX].flatMap((x) => [-display.halfY, display.halfY].flatMap((y) => [-0.18, 0.18].map((z) => project([x, z, y]))));
        const left = Math.min(...corners.map((p) => p.x), ...nextLabels.map((p) => p.x));
        const right = Math.max(...corners.map((p) => p.x), ...nextLabels.map((p) => p.x + p.width));
        const top = Math.min(...corners.map((p) => p.y), ...nextLabels.map((p) => p.y));
        const bottom = Math.max(...corners.map((p) => p.y), ...nextLabels.map((p) => p.y + p.height));
        const ratio = Math.max((right - left + 8) / rect.width, (bottom - top + 8) / rect.height);
        if (left >= 3 && right <= rect.width - 3 && top >= 3 && bottom <= rect.height - 3) break;
        shiftX += ((left + right) / 2 - rect.width / 2) * 2 * view * aspect / rect.width / camera.zoom;
        shiftY -= ((top + bottom) / 2 - rect.height / 2) * 2 * view / rect.height / camera.zoom;
        view *= Math.max(1.01, ratio);
      }
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      selected = projectedAxes(display, data, sides, project);
      sides.z = selected.z;
      // Detail zoom intentionally crops at the existing chart viewport. Keep
      // labels on their true projected axes rather than fitting zoom away.
      nextLabels = layoutLabels(selected.axes, project, project([0, 0, 0]), measure, rect, zoom <= 1);
      const axisLines = selected.axes.flatMap((axis) => {
        const lines = [...axis.a, ...axis.b];
        for (let tick = 0; tick <= 4; tick++) {
          const anchor = axis.a.map((value, index) => value + (axis.b[index] - value) * tick / 4) as Point;
          const end: Point = [...anchor];
          const coordinate = axis.id === 'x' ? 2 : 0;
          end[coordinate] += (Math.sign(end[coordinate]) || 1) * 0.012;
          lines.push(...anchor, ...end);
        }
        return lines;
      });
      replace(axes, geometry(axisLines));
      labels = nextLabels;
      const points = [];
      for (let index = 0; index < display.positions.length; index += 3) points.push(project(display.positions.slice(index, index + 3) as Point));
      const left = Math.min(...points.map((p) => p.x));
      const top = Math.min(...points.map((p) => p.y));
      projection = { left, top, width: Math.max(...points.map((p) => p.x)) - left, height: Math.max(...points.map((p) => p.y)) - top };
      renderer.render(scene, camera);
    };
    updateData = (next) => {
      data = next;
      display = meshDisplay(next);
      const nextGeometry = geometry(display.positions);
      const colors = next.matrix.flat().flatMap((value) => {
        const color = new THREE.Color(meshColor(value, next.summary.minimum, next.summary.range));
        return [color.r, color.g, color.b];
      });
      nextGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      nextGeometry.setIndex(display.indices);
      nextGeometry.computeVertexNormals();
      replace(surface, nextGeometry);
      gridKey = '';
      render();
    };
    resetView = () => {
      camera.position.set(0.92, 0.78, 1.04);
      camera.zoom = 1;
      controls.target.set(0, 0, 0);
      controls.update();
      render();
    };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      render();
    };
    controls.addEventListener('change', render);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    observer.observe(host.querySelector('[data-font-probe]')!);
    resetView();
    updateData(data);
    resize();
    return () => {
      observer.disconnect();
      controls.removeEventListener('change', render);
      controls.dispose();
      [surface.geometry, grid.geometry, axes.geometry, surfaceMaterial, gridMaterial, axisMaterial].forEach((item) => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      resetView = undefined;
      updateData = undefined;
    };
  });
</script>

<div class="three-host" bind:this={host} data-bed-mesh-3d>
  <span class="font-probe" data-font-probe aria-hidden="true">M</span>
  {#if projection}
    <div class="surface-projection" data-surface-projection data-ready="true" style={`left:${projection.left}px;top:${projection.top}px;width:${projection.width}px;height:${projection.height}px`} aria-hidden="true"></div>
  {/if}
  {#each labels as label (label.id)}
    <div class="axis-label" data-axis-label data-axis={label.id} data-anchor-x={label.anchor.x} data-anchor-y={label.anchor.y} style={`left:${label.x}px;top:${label.y}px;width:${label.width}px;height:${label.height}px`} aria-hidden="true">{label.text}</div>
  {/each}
</div>

<style>
  .three-host { position: relative; width: 100%; height: 100%; overflow: hidden; font: 600 0.75rem/1.2 var(--u1-font); }
  .three-host :global(canvas) { position: absolute; inset: 0; display: block; }
  .font-probe { position: absolute; visibility: hidden; pointer-events: none; }
  .surface-projection { position: absolute; pointer-events: none; opacity: 0; }
  .axis-label { position: absolute; display: grid; place-items: center; z-index: 2; color: #59636d; font: inherit; font-variant-numeric: tabular-nums; white-space: nowrap; pointer-events: none; }
</style>
