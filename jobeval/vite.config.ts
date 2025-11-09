import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Read version from package.json
import { readFileSync } from 'fs'
const packageJson = JSON.parse(
  readFileSync('./package.json', 'utf-8')
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
})
