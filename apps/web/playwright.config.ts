import { defineConfig } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

/** Runs against the built static export in out/; run `pnpm build` first. */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    channel: process.env.E2E_CHANNEL ?? 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/serve.ts',
    env: { PORT: String(port) },
    url: baseURL,
    reuseExistingServer: false,
  },
});
