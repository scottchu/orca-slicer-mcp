import { choice, exact, flag } from './validation';
import { basename, domainKeys, domainReceipt, focusedBase, nonnegative, printStates, reported } from './focused-validation';
import type { JobsPresentation } from './focused-presentation';
export const adaptJobs = (value: unknown): JobsPresentation => {
  const { module, base } = focusedBase(value, 'jobs');
  const keys = ['printState', 'filename', 'storageActive', 'filePositionBytes', 'fileSizeBytes', 'totalDurationSeconds', 'printDurationSeconds', 'filamentUsedMillimeters'];
  exact(module, [...domainKeys, ...keys]);
  const receipt = domainReceipt(module, base);
  const values = { printState: reported(module.printState, value => choice(value, printStates)), filename: reported(module.filename, basename), storageActive: reported(module.storageActive, flag), filePositionBytes: reported(module.filePositionBytes, nonnegative), fileSizeBytes: reported(module.fileSizeBytes, nonnegative), totalDurationSeconds: reported(module.totalDurationSeconds, nonnegative), printDurationSeconds: reported(module.printDurationSeconds, nonnegative), filamentUsedMillimeters: reported(module.filamentUsedMillimeters, nonnegative) };
  if (base.state !== 'known' && base.state !== 'stale' && Object.values(values).some(field => field.reported || field.value !== null)) throw new Error('Unobserved Current Job values');
  return { ...base, kind: 'jobs', receipt, ...values };
};
