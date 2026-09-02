import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser/visual', testMatch: 'kit-fans.spec.ts', workers: 1,
  outputDir: './test-results/unified-app/kit-browser', reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4181', browserName: 'chromium', channel: 'chrome', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'PORT=4181 bun run scripts/serve-kit-fixture.ts', port: 4181, reuseExistingServer: false, timeout: 20_000 }
});
