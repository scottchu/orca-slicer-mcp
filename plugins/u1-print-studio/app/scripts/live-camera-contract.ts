import { assertWidgetClientModule } from './observation-graph-contract';

export const assertLiveCameraModule = (module: string): void => {
  assertWidgetClientModule(module);
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$|\/(?:tests|(?:components|lib\/client)\/(?:lab|observation|bed-mesh))\/|\/three\/|\/(?:components|lib\/client)\/camera\/(?:state|controller|lab-location)\.|\/(?:components|lib\/client)\/camera\/Camera(?:Lab|Media|Status)/.test(module)) throw new Error('Live Camera imported nonproduction source');
};
export const assertLiveCameraArtifact = (html: string): void => {
  for (const forbidden of ['Lab fixture', 'SYNTHETIC CAMERA', 'captureStream', 'getUserMedia', 'CameraLab', 'Three.js']) {
    if (html.includes(forbidden)) throw new Error('Live Camera contains nonproduction marker');
  }
  if ((html.match(/<script>/g) ?? []).length !== 1 || (html.match(/<style>/g) ?? []).length !== 1 || /<(?:script|link)[^>]+(?:src|href)\s*=/.test(html)) throw new Error('Live Camera must be one self-contained artifact');
};
