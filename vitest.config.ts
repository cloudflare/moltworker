import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    include: ['src/**/*.test.ts', 'moltlazy/**/*.test.ts'],
    exclude: ['src/client/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/client/**', 'node_modules/**', '**/*.test.ts'],
    },
  },
})
