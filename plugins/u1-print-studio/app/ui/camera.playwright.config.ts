import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/visual', testMatch: 'camera-lab.spec.ts',
  outputDir: './test-results/camera-playwright', fullyParallel: false,
  reporter: [['list']],
  use: { browserName: 'chromium', channel: 'chrome', colorScheme: 'light', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
