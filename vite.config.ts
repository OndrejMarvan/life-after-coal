import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  // Shown in the footer copyright as the month the site was last built.
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()) },
})
