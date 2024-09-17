import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,     // Allows access via your local network
    port: 3000,     // Optional: You can set a specific port (default is 5173)
    open: true,     // Optional: Automatically open in the browser
  },
})
