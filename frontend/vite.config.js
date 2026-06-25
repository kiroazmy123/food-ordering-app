import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this site from /food-ordering-app/, not the domain
  // root, so every asset URL needs that prefix or they'll all 404.
  base: '/food-ordering-app/',
})