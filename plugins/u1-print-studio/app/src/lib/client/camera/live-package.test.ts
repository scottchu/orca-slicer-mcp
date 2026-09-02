import { describe, expect, it } from 'vitest';
import { assertLiveCameraArtifact, assertLiveCameraModule } from '../../../../scripts/live-camera-contract';
describe('isolated production Camera artifact', () => {
  it('accepts self-contained artifacts independently of byte size', () => {
    const shell = '<!doctype html><style></style><script></script>';
    for (const extra of [' '.repeat(100_001), '漢'.repeat(100_000)]) expect(() => assertLiveCameraArtifact(shell + extra)).not.toThrow();
  });
  it('rejects fixture/test/Three source graph entries and runtime assets', () => {
    for (const path of ['/src/lib/server/camera.ts', '/src/routes/media/camera.webrtc/+server.ts', '/.svelte-kit/output/server/index.js', '/src/lib/client/camera/session.test.ts', '/src/lib/client/camera/peer.spec.ts', '/src/tests/fixtures/live-camera.ts', '/src/components/camera/CameraMedia.svelte', '/src/lib/client/camera/state.ts', '/src/lib/client/observation/types.ts', '/node_modules/three/build/three.js']) expect(() => assertLiveCameraModule(path)).toThrow();
    for (const path of ['/src/lib/client/camera/live-controller.ts', '/src/lib/client/camera/runtime.ts', '/src/components/common/Video.svelte', '/src/lib/client/host/rpc.ts']) expect(() => assertLiveCameraModule(path)).not.toThrow();
    for (const content of ['captureStream', 'SYNTHETIC CAMERA', '<script src="remote.js"></script>', '<link href="remote.css">']) expect(() => assertLiveCameraArtifact(`<style></style><script></script>${content}`)).toThrow();
  });
});
