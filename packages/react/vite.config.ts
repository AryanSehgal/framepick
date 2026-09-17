import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  publicDir: false,
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es"],
      fileName: "framepick",
      cssFileName: "framepick",
    },
    rolldownOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { banner: '"use client";' },
    },
  },
});
