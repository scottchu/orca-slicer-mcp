import { describe, expect, it } from 'vitest';
import { assertLiveCameraArtifact, assertLiveCameraModule } from '../../../scripts/live-camera-contract';
describe('isolated production Camera artifact', () => {
  it('accepts self-contained artifacts independently of byte size', () => {
    const shell = '<!doctype html><style></style><script></script>';
    for (const extra of [' '.repeat(100_001), '漢'.repeat(100_000)]) expect(() => assertLiveCameraArtifact(shell + extra)).not.toThrow();
  });
  it('rejects fixture/test/Three source graph entries and runtime assets', () => {
    for (const path of ['/src/lib/camera/session.test.ts', '/src/lib/camera/peer.spec.ts', '/src/tests/fixtures/live-camera.ts', '/src/lib/camera/CameraMedia.svelte', '/src/lib/camera/state.ts', '/src/lib/observation/types.ts', '/node_modules/three/build/three.js']) expect(() => assertLiveCameraModule(path)).toThrow();
    for (const path of ['/src/lib/camera/live-controller.ts', '/src/lib/camera/runtime.ts', '/src/lib/common/Video.svelte', '/src/lib/host/rpc.ts']) expect(() => assertLiveCameraModule(path)).not.toThrow();
    for (const content of ['captureStream', 'SYNTHETIC CAMERA', '<script src="remote.js"></script>', '<link href="remote.css">']) expect(() => assertLiveCameraArtifact(`<style></style><script></script>${content}`)).toThrow();
  });
});
