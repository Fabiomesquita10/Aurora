import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeJsonPlugin } from './vite-plugin-write-json.js'

export default defineConfig(({ mode }) => {
  // Definir VITE_DEV_MODE baseado no modo
  const isDevMode = mode === 'dev'
  
  return {
    plugins: [react(), writeJsonPlugin()],
    server: {
      host: true, // Listen on all addresses
      allowedHosts: true, // Allow all hosts (useful for ngrok and development)
    },
    define: {
      'import.meta.env.VITE_DEV_MODE': JSON.stringify(isDevMode),
    },
  }
})
