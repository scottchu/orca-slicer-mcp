import type { RuntimeRequest } from './lib/server/runtime-port';
declare global {
  namespace App {
    interface Platform { req: RuntimeRequest }
  }
}
export {};
