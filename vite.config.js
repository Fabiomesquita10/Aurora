import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeJsonPlugin } from './vite-plugin-write-json.js'

export default defineConfig({
  plugins: [react(), writeJsonPlugin()],
})
