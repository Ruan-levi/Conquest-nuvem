import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => ({
  base: process.env.GITHUB_PAGES === "true" ? "/Conquest-nuvem/" : "/",
  server: { host: "0.0.0.0" },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"]
  }
}));
