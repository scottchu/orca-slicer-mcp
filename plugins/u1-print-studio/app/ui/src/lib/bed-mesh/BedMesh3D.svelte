<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { meshColor } from './palette';
  import type { BedMeshObservation } from './types';

  let { observation, resetKey = 0 }: { observation: BedMeshObservation; resetKey?: number } = $props();
  let host: HTMLDivElement;
  let resetView: (() => void) | undefined;
  $effect(() => { resetKey; resetView?.(); });

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
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x59616a, transparent: true, opacity: 0.18 });
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
      const [geometry, material] = line([bounds.xMin, height, bounds.yMin, bounds.xMax, height, bounds.yMin, bounds.xMin, height, bounds.yMin, bounds.xMin, height, bounds.yMax], 0xd9dde1, 0.82);
      disposables.push(geometry, material);
    }
    const [axisGeometry, axisMaterial] = line([
      bounds.xMin, zLow, bounds.yMin, bounds.xMax, zLow, bounds.yMin,
      bounds.xMin, zLow, bounds.yMin, bounds.xMin, zLow, bounds.yMax,
      bounds.xMin, zLow, bounds.yMin, bounds.xMin, zHigh, bounds.yMin
    ], 0x69717a, 0.92);
    disposables.push(axisGeometry, axisMaterial);

    const makeLabel = (text: string, position: THREE.Vector3) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      const context = canvas.getContext('2d')!;
      context.font = '500 24px Inter, system-ui, sans-serif';
      context.fillStyle = '#5f6770';
      context.textAlign = 'center';
      context.fillText(text, 128, 38);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(xySpan * 0.22, xySpan * 0.055, 1);
      scene.add(sprite);
      disposables.push(texture, material);
    };
    makeLabel('X (mm)', new THREE.Vector3((bounds.xMin + bounds.xMax) / 2, zLow - xySpan * 0.06, bounds.yMin));
    makeLabel('Y (mm)', new THREE.Vector3(bounds.xMin - xySpan * 0.09, zLow, (bounds.yMin + bounds.yMax) / 2));
    makeLabel('Z (mm)', new THREE.Vector3(bounds.xMin - xySpan * 0.08, (zLow + zHigh) / 2, bounds.yMin));
    makeLabel(`${observation.summary.minimum.toFixed(3)}`, new THREE.Vector3(bounds.xMin - xySpan * 0.07, zLow, bounds.yMin));
    makeLabel(`${observation.summary.maximum.toFixed(3)}`, new THREE.Vector3(bounds.xMin - xySpan * 0.07, zHigh, bounds.yMin));

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, xySpan * 20 + 10);
    const target = new THREE.Vector3((bounds.xMin + bounds.xMax) / 2, 0, (bounds.yMin + bounds.yMax) / 2);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minPolarAngle = THREE.MathUtils.degToRad(18);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(74);
    controls.minZoom = 0.75;
    controls.maxZoom = 3.5;
    const initialOffset = new THREE.Vector3(xySpan * 1.15, xySpan * 0.82, xySpan * 1.1);
    resetView = () => {
      camera.position.copy(target).add(initialOffset);
      camera.zoom = 1;
      controls.target.copy(target);
      camera.updateProjectionMatrix();
      controls.update();
      render();
    };
    const render = () => renderer.render(scene, camera);
    controls.addEventListener('change', render);
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const aspect = Math.max(0.1, rect.width / Math.max(1, rect.height));
      const view = xySpan * 0.78;
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

<div class="three-host" bind:this={host} data-bed-mesh-3d></div>

<style>
  .three-host { width: 100%; height: 100%; }
</style>
