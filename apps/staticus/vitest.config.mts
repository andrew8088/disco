import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    // setupFiles: "src/testSetup.ts",
    fileParallelism: false,
  },
});
