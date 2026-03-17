import path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()] as never[],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e/**", ".git", ".cache", "coverage", "build", "src/mocks"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "coverage/",
        "src/mocks/",
        "src/tests/setup.ts",
        "src/tests/test-utils.tsx",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    env: {
      VITE_API_URL: "http://localhost:3000",
      VITE_APP_ENV: "development",
      VITE_GOOGLE_MAPS_API_KEY: "test_google_maps_api_key",
      VITE_GOOGLE_MAPS_MAP_ID: "test_google_maps_map_id",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      tests: path.resolve(__dirname, "./tests"),
    },
  },
});
