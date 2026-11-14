// Configuración de las pruebas. Vitest es el "test runner" de este proyecto (usa Vite, igual que Jest
// en Create React App) y tiene la misma API: describe, test, expect, beforeEach y las funciones espía (vi.fn = jest.fn).
// React Testing Library renderiza los componentes y Jest DOM agrega matchers como toBeInTheDocument().
// Las pruebas viven junto al código: archivos *.test.js y *.test.jsx.
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',                    // un "navegador" falso para poder renderizar componentes
    globals: true,                           // describe, test y expect sin importarlos (como en Jest)
    setupFiles: ['./src/test/setup.js'],     // activa los matchers de Jest DOM
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/modules/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/test/**'],
      reporter: ['text', 'html'],
    },
  },
})
