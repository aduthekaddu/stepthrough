import { defineConfig, devices } from '@playwright/test';

/** Runs against the static export (`pnpm build` first). E2E_PORT and PLAYWRIGHT_CHANNEL override. */
const port = Number(process.env.E2E_PORT ?? 4173);
const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) } },
  ],
  webServer: {
    command: `node e2e/serve.ts ${port}`,
    url: `http://localhost:${port}/playground/viz/`,
    reuseExistingServer: !process.env.CI,
  },
});
