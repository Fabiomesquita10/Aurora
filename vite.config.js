import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeJsonPlugin } from './vite-plugin-write-json.js'

export default defineConfig({
  plugins: [react(), writeJsonPlugin()],
  server: {
    allowedHosts: ['all'], // Allows all hosts including ngrok
    // Alternatively, you can specify specific hosts:
    // allowedHosts: ['8533af21939a.ngrok-free.app', 'localhost']
  },
})
