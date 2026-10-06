import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy das rotas de autenticação para o backend Express (server.ts) em
      // desenvolvimento. Mantém API e SPA na mesma origem (localhost:3000), o
      // que faz o cookie de sessão funcionar sem CORS/SameSite estranho.
      proxy: {
        '/auth': 'http://localhost:3001',
      },
    },
  };
});
