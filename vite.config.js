import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps every asset path relative so the built site works both when
// served from a GitHub Pages project subpath (/yhct-hoa-sinh-2026/) and locally.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // The question bank (~690 KB JSON) is bundled and needed up front, so the
  // single chunk is expectedly large; raise the limit to keep build output clean.
  build: { chunkSizeWarningLimit: 900 },
  // Stamped into asset URLs (see officeViewerUrl) so each deploy busts
  // Microsoft's Office Online viewer cache, which otherwise keeps showing a
  // stale rendering of on-tap-trac-nghiem.docx after it changes.
  define: { __BUILD_ID__: JSON.stringify(Date.now()) },
})
