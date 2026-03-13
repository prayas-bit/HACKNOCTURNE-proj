import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import viteSourcePathPlugin from '../core-server/plugins/plugin-source-path.js'

export default defineConfig({
  plugins: [
    viteSourcePathPlugin(),
    react(),
  ],
})