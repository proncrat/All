import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
//import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/

const dir = import.meta.dirname

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dir, './'),
      '@server': path.resolve(dir, './server'),
    },
  },
  plugins: [react(), tailwindcss() /*tsconfigPaths()*/],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
