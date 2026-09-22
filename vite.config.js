import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5174,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        calculator: resolve(__dirname, 'calculator.html'),
        riskProfiling: resolve(__dirname, 'risk-profiling.html'),
        sid: resolve(__dirname, 'sid.html')
      }
    }
  }
});
