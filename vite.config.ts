import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Configuration Multi-Page App (MPA)
  // Chaque entrée correspond à une page HTML du projet.
  // Vite génèrera un bundle optimisé pour chacune lors du build.
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        table: resolve(__dirname, 'table.html'),
        stats: resolve(__dirname, 'stats.html'),
      }
    }
  }
})
