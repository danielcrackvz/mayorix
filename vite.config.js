import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // o vue, según tu proyecto

export default defineConfig({
  plugins: [react()],
  base: '/mayorix/', // <-- Agrega exactamente esto (el nombre de tu repo entre barras)
})