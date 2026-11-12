import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const envDir = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, 'PORT');
  const apiPort = process.env.PORT ?? env.PORT ?? '3001';

  return {
    plugins: [react(), tailwindcss()],
    envDir,
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': `http://127.0.0.1:${apiPort}`,
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
