/** Cold upstream acquisition and viewer ICE gathering precede the viewer offer. */
export const CAMERA_OPEN_TIMEOUT_MS = 40_000;
/** Keep a timed-out allocation observable for the server's unanswered lease window. */
export const CAMERA_OPEN_RESPONSE_TIMEOUT_MS = CAMERA_OPEN_TIMEOUT_MS + 15_000;
