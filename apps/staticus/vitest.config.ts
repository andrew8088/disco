import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // setupFiles: "src/testSetup.ts",
    fileParallelism: false,
  },
});
