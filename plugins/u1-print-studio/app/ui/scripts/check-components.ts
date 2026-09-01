import { resolve } from 'node:path';
import { checkComponents } from './component-contract';
const failures = checkComponents(resolve(import.meta.dir, '../src/lib'));
if (failures.length) throw new Error(failures.join('\n'));
console.log('component contracts: migrated composites contain zero native HTML; untouched debt bounded');
