import { defineConfig, devices } from '@playwright/test';

/**
 * Runs against the static export in out/ (`pnpm build` first). Uses the system Chrome by
 * default; PLAYWRIGHT_CHANNEL overrides it and E2E_PORT overrides the port. With
 * PAGES_BASE_PATH set, the site is served under that path, so tests navigate with relative URLs.
 */
const port = Number(process.env.E2E_PORT ?? 4173);
const origin = `http://127.0.0.1:${port}${process.env.PAGES_BASE_PATH ?? ''}/`;
const channel = process.env.PLAYWRIGHT_CHANNEL ?? 'chrome';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: origin, trace: 'retain-on-failure' },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel } }],
  webServer: {
    command: `node e2e/serve.ts ${port}`,
    url: origin,
    reuseExistingServer: false,
  },
});
