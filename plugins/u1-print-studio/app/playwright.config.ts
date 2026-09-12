import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser/visual',
  // The private composition uses its pinned immutable preview, never the static Lab host.
  testIgnore: '**/composable-lab.spec.ts',
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
  webServer: [{
    command: 'PORT=4179 bun run scripts/serve-private-lab-fixture.ts',
    port: 4179,
    reuseExistingServer: false,
    timeout: 20_000
  }, {
    command: 'PORT=4181 bun run scripts/serve-kit-fixture.ts',
    port: 4181,
    reuseExistingServer: false,
    timeout: 20_000
  }]
});
