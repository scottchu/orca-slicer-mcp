import { describe, expect, it } from 'vitest';
import { CAMERA_SCENARIOS, cameraScenario, cameraCapability, frameRate, isCameraScenario } from './state';

describe('camera lab state and frame evidence', () => {
  it('admits only the seven closed synthetic states', () => {
    expect(CAMERA_SCENARIOS.map(({ value }) => value)).toEqual(['loading', 'connecting', 'snapshot', 'live', 'fallback', 'error', 'unsupported']);
    CAMERA_SCENARIOS.forEach(({ value }) => expect(cameraScenario(value)).toBe(value));
    for (const value of [null, undefined, {}, [], 'LIVE', 'printer', 'live\n']) {
      expect(isCameraScenario(value)).toBe(false);
      expect(cameraScenario(value)).toBe('error');
    }
  });
  it('uses advancing frame evidence spanning at least one second', () => {
    expect(frameRate(1, 16, 1000)).toBe(15);
    expect(frameRate(16, 46, 2000)).toBe(15);
    for (const values of [[1, 16, 999], [1, 1, 1000], [16, 1, 1000], [-1, 10, 1000], [1, 400, 1000], [NaN, 30, 1000], [1, Infinity, 1000], [1, 30, Infinity]]) {
      expect(frameRate(...values as [number, number, number])).toBeNull();
    }
  });
  it('invalid capability policy restricts rather than grants display support', () => {
    for (const value of ['native', 'unsupported', 'denied']) expect(cameraCapability(value)).toBe(value);
    for (const value of [null, {}, 'native\n', 'all']) expect(cameraCapability(value)).toBe('unsupported');
  });
});
