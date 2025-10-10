import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@idle-tycoon/sim-core': path.resolve(__dirname, './packages/sim-core/src'),
      '@idle-tycoon/ui-kit': path.resolve(__dirname, './packages/ui-kit/src'),
      '@': path.resolve(__dirname, './apps/web'),
    },
  },
});