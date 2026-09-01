import { mount } from 'svelte';
import '../../src/lib/ui/tokens.css';
import BedMeshHarness from './BedMeshHarness.svelte';
import { BufferGeometry } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let controls: OrbitControls;
let surface: BufferGeometry;
let disposals = 0;
OrbitControls.prototype.update = new Proxy(OrbitControls.prototype.update, { apply: (fn, self, args) => { controls = self; return Reflect.apply(fn, self, args); } });
BufferGeometry.prototype.setAttribute = new Proxy(BufferGeometry.prototype.setAttribute, { apply: (fn, self, args) => { if (args[0] === 'color') surface = self; return Reflect.apply(fn, self, args); } });
BufferGeometry.prototype.dispose = new Proxy(BufferGeometry.prototype.dispose, { apply: (fn, self, args) => { disposals++; return Reflect.apply(fn, self, args); } });
Object.assign(window, {
  meshControls: () => controls,
  meshOrbit: (azimuth: number, polar: number) => {
    controls.object.position.setFromSphericalCoords(1.6, polar, azimuth);
    controls.update();
  },
  meshState: () => {
    return { positions: [...surface.getAttribute('position').array], colors: [...surface.getAttribute('color').array], camera: controls.object.position.toArray(), zoom: (controls.object as import('three').OrthographicCamera).zoom, disposals };
  }
});
mount(BedMeshHarness, { target: document.body });
