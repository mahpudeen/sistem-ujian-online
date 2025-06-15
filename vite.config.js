import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url';

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Optional
      'utilities': path.resolve(__dirname, 'src/utilities'),
      components: path.resolve(__dirname, 'src/components')
    },
  },
  server: {
    port: 3005, // atur port di sini
  },
})
