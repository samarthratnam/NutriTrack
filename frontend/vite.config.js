import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for React app.
// Proxy routes all /api calls to local FastAPI backend to avoid CORS friction in development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
