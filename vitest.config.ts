import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'nexusforge',
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
