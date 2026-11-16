import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  // tsconfig keeps JSX for Next.js to compile; tests that render components compile it here.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'e2e/**', '.next/**', 'out/**'],
  },
});
