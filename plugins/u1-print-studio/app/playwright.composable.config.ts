import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser/visual',
  testMatch: 'composable-lab.spec.ts',
  workers: 1,
  outputDir: './test-results/composable-lab/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4183',
    browserName: 'chromium',
    channel: 'chrome',
    colorScheme: 'light',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'PORT=4183 bun run scripts/serve-kit-fixture.ts',
    port: 4183,
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
