import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: path.resolve(__dirname, 'preview'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@hermes/plugin-sdk': path.resolve(__dirname, 'preview/sdk-stub.tsx')
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
})
