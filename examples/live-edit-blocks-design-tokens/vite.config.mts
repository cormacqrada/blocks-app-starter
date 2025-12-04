import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: "./",
  resolve: {
    alias: {
      "@blocks/core": path.resolve(__dirname, "../../packages/core/src"),
      "@blocks/runtime": path.resolve(__dirname, "../../packages/runtime/src"),
      "@blocks/renderer": path.resolve(__dirname, "../../packages/renderer/src")
    }
  },
  build: {
    outDir: "dist"
  }
});
