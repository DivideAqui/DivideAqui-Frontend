import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
      ViteImageOptimizer({
        jpg: {quality: 75},
        png: {quality: 75},
      }),
  ],
})
