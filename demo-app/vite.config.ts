import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteMetadataPlugin } from '../core-server/plugins/vite-metadata';

export default defineConfig({
  plugins: [
    react(),
    viteMetadataPlugin()
  ],
  server: {
    port: 5173
  }
});
