import { lstatSync, readdirSync } from 'node:fs';

/** @param {string} directory */
export const isolatedKitEnvDirectory = (directory) => {
  // This source-owned directory persists with the checkout. No temporary
  // directory, process hook or runtime cleanup is needed. Inspect names/types
  // only; unexpected dotenv files must never be opened by the Kit loader.
  if (!lstatSync(directory).isDirectory() || readdirSync(directory, { withFileTypes: true }).some((entry) => entry.name !== '.gitkeep' || !entry.isFile())) {
    throw new Error('The SvelteKit environment directory must contain only .gitkeep');
  }
  return directory;
};
