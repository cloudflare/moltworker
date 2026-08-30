import { defineConfig } from 'vitest/config'

export default defineConfig({
  assetsInclude: ['**/*.html'],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts', 'container/**/*.test.ts'],
    exclude: ['src/client/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/client/**', 'node_modules/**', '**/*.test.ts'],
    },
  },
})
