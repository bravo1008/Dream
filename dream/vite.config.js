// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://dream-gjai.onrender.com", // 后端地址
        changeOrigin: true,
        secure: false,
      },
    },
  },
});