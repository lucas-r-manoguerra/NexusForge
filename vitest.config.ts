import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
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
