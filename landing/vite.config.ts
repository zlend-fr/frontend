import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@provablehq/wasm", "@demox-labs/aleo-sdk"],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  base: '/',
});