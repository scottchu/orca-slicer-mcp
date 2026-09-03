import { expect, it } from 'vitest';
import { cameraLiveFailureMessage, type CameraLiveFailure } from './failure';

it.each([
  ['activation', 'timeout', 'not-created', false, 'Live setup timed out'],
  ['offer', 'rejected', 'not-created', false, 'Live request failed'],
  ['local-answer', 'timeout', 'new', false, 'Video setup timed out'],
  ['answer', 'timeout', 'connecting', false, 'Live reply timed out'],
  ['candidate', 'timeout', 'connecting', false, 'Connection update timed out'],
  ['first-frame', 'timeout', 'connecting', false, 'Connection timed out'],
  ['first-frame', 'timeout', 'connected', false, 'Video timed out'],
  ['connection', 'failed', 'failed', false, 'Connection failed'],
  ['playback', 'timeout', 'connected', true, 'Video stalled'],
  ['playback', 'ended', 'connected', true, 'Video ended'],
] as const)('maps %s to human wording without debug data', (stage, outcome, connectionState, hadFrame, expected) => {
  const failure: CameraLiveFailure = { stage, outcome, connectionState, hadFrame, elapsedMs: 8000 };
  expect(cameraLiveFailureMessage(failure)).toBe(expected);
});
