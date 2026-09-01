import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './test-results/playwright',
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4179',
    browserName: 'chromium',
    channel: 'chrome',
    colorScheme: 'light',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'PORT=4179 bun run scripts/serve-private-lab-fixture.ts',
    port: 4179,
    reuseExistingServer: false,
    timeout: 20_000
  }
});
