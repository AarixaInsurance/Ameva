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
        sid: resolve(__dirname, 'sid.html'),
        disclaimer: resolve(__dirname, 'disclaimer.html'),
        privacyPolicy: resolve(__dirname, 'privacy-policy.html'),
        grievance: resolve(__dirname, 'grievance.html'),
        commissionDisclosures: resolve(__dirname, 'commission-disclosures.html'),
        clientAgreement: resolve(__dirname, 'client-agreement.html')
      }
    }
  }
});
