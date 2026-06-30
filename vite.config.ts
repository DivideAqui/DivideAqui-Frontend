<<<<<<< HEAD
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
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
>>>>>>> f516fa4b3ea1a1f3366fd7b423d9869b8d24b1c5
