import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteSourcePathPlugin from '../core-server/plugins/plugin-source-path.js'

export default defineConfig({
  plugins: [
    viteSourcePathPlugin(),
    react(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.js'],
    coverage: {
      provider: 'istanbul', 
      reporter: ['lcov', 'text'],
      reportsDirectory: './coverage',
      include: ['src/components/**/*.jsx', 'src/App.jsx'],
      all: true, 
    },
  }
})