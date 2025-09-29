import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['3002-io0sufvgs7eq6lwi6rgt6-6532622b.e2b.dev', '.e2b.dev'],
    hmr: {
      clientPort: 443
    }
  }
})