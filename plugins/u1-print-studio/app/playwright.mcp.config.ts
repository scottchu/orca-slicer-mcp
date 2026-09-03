import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser/mcp',
  outputDir: './test-results/mcp-playwright',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4182',
    browserName: 'chromium',
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'bun --no-env-file --config=/dev/null run scripts/serve-mcp-widget-fixture.ts',
    port: 4182,
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
