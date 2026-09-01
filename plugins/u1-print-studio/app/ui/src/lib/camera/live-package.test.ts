import { describe, expect, it } from 'vitest';
import { assertLiveCameraArtifact, assertLiveCameraModule, LIVE_CAMERA_BYTE_LIMIT } from '../../../scripts/live-camera-contract';
describe('independently bounded production Camera artifact', () => {
  it('enforces raw UTF-8 bytes without borrowing lab allowances', () => {
    const shell = '<!doctype html><style></style><script></script>';
    expect(() => assertLiveCameraArtifact(shell + ' '.repeat(LIVE_CAMERA_BYTE_LIMIT - shell.length))).not.toThrow();
    expect(() => assertLiveCameraArtifact(shell + ' '.repeat(LIVE_CAMERA_BYTE_LIMIT - shell.length) + 'x')).toThrow('100 KB');
    expect(() => assertLiveCameraArtifact(shell + '漢'.repeat(34_000))).toThrow('100 KB');
  });
  it('rejects fixture/test/Three source graph entries and runtime assets', () => {
    for (const path of ['/src/lib/camera/session.test.ts', '/src/lib/camera/peer.spec.ts', '/src/tests/fixtures/live-camera.ts', '/src/lib/camera/CameraMedia.svelte', '/src/lib/camera/state.ts', '/src/lib/observation/types.ts', '/node_modules/three/build/three.js']) expect(() => assertLiveCameraModule(path)).toThrow();
    for (const path of ['/src/lib/camera/live-controller.ts', '/src/lib/camera/runtime.ts', '/src/lib/media/VideoSurface.svelte', '/src/lib/host/rpc.ts']) expect(() => assertLiveCameraModule(path)).not.toThrow();
    for (const content of ['captureStream', 'SYNTHETIC CAMERA', '<script src="remote.js"></script>', '<link href="remote.css">']) expect(() => assertLiveCameraArtifact(`<style></style><script></script>${content}`)).toThrow();
  });
});
