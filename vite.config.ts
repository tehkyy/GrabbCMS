import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());
  const target = env.VITE_DROPPER;

  console.log(`Vite proxy target: ${target}`);

  if (!target) {
    throw new Error('VITE_DROPPER environment variable is not set');
  }

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`Proxying request ${req.method} ${req.url} to ${target}`);
            });
          },
        },
      },
    },
  });
};
