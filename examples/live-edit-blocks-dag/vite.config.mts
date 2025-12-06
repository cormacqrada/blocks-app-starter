import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: "./",
  resolve: {
    alias: {
      "@blocks-ecosystem/core": path.resolve(__dirname, "../../packages/core/src"),
      "@blocks-ecosystem/runtime": path.resolve(__dirname, "../../packages/runtime/src"),
      "@blocks-ecosystem/renderer": path.resolve(__dirname, "../../packages/renderer/src"),
    }
  },
  build: {
    outDir: "dist"
  }
});
