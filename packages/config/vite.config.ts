import { defineConfig, type PluginOption } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default function createConfig(root: string, plugins: PluginOption[] = []) {
  return defineConfig({
    build: {
      lib: {
        entry: resolve(root, "src/index.ts"),
        formats: ["es"],
        name: "index",
        fileName: "index",
      },
    },
    plugins: [dts(), ...plugins],
  });
}
