import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Qikpos",
      fileName: (format) => `qikpos.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [], // Si quieres excluir deps externas
    },
  },
  plugins: [dts()],
});
