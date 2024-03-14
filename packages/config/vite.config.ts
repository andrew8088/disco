import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default function createConfig(root: string) {
  return defineConfig({
    build: {
      lib: {
        entry: resolve(root, "src/index.ts"),
        formats: ["es"],
        name: "index",
        fileName: "index",
      },
    },
    plugins: [dts()],
  });
}
