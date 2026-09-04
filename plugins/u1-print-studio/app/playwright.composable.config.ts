import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser/visual',
  testMatch: 'composable-lab.spec.ts',
  workers: 1,
  outputDir: './test-results/composable-lab-v2/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4184',
    browserName: 'chromium',
    channel: 'chrome',
    colorScheme: 'light',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'PORT=4184 COMPOSABLE_KIT_FIXTURE_DIR=build-kit-composable-v2 bun --no-env-file --config=/dev/null run scripts/serve-kit-fixture.ts',
    port: 4184,
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
