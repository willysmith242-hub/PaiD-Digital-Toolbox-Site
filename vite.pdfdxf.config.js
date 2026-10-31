import { defineConfig } from "vite";

export default defineConfig({
  configFile: false,
  build: {
    outDir: "vendor",
    emptyOutDir: false,
    lib: {
      entry: "src/pdf-to-dxf-entry.js",
      formats: ["es"],
      fileName: () => "pdf-to-dxf.bundle.js"
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: "pdf-worker-[name][extname]"
      }
    },
    target: "es2020",
    sourcemap: false
  }
});
