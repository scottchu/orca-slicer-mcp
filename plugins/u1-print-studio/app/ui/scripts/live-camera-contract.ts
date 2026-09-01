export const LIVE_CAMERA_BYTE_LIMIT = 100_000;
export const assertLiveCameraModule = (module: string): void => {
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:tests|lib\/lab|lib\/observation|lib\/bed-mesh)\/|\/three\/|\/lib\/camera\/(?:state|controller|lab-location)\.|\/lib\/camera\/Camera(?:Lab|Media|Status)/.test(module)) throw new Error('Live Camera imported nonproduction source');
};
export const assertLiveCameraArtifact = (html: string): void => {
  if (new TextEncoder().encode(html).byteLength > LIVE_CAMERA_BYTE_LIMIT) throw new Error('Live Camera exceeded its 100 KB single-artifact budget');
  for (const forbidden of ['Lab fixture', 'SYNTHETIC CAMERA', 'captureStream', 'getUserMedia', 'CameraLab', 'Three.js']) {
    if (html.includes(forbidden)) throw new Error('Live Camera contains nonproduction marker');
  }
  if ((html.match(/<script>/g) ?? []).length !== 1 || (html.match(/<style>/g) ?? []).length !== 1 || /<(?:script|link)[^>]+(?:src|href)\s*=/.test(html)) throw new Error('Live Camera must be one self-contained artifact');
};
