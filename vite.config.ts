import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Configuration Multi-Page App (MPA)
  // Chaque entrée correspond à une page HTML du projet.
  // Vite génèrera un bundle optimisé pour chacune lors du build.
  build: {
    rollupOptions: {
      input: {
        // Pages Tailwind
        main:      resolve(__dirname, 'index.html'),
        table:     resolve(__dirname, 'table.html'),
        stats:     resolve(__dirname, 'stats.html'),
        // Pages SASS (version sans Tailwind)
        sassIndex: resolve(__dirname, 'sass-index.html'),
        sassTable: resolve(__dirname, 'sass-table.html'),
        sassStats: resolve(__dirname, 'sass-stats.html'),
      }
    }
  }
})
