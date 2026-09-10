import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1422,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
