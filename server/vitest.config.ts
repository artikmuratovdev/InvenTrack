import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["tests/globalSetup.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "test-secret-test-secret-test-secret-123456",
      CORS_ORIGIN: "http://localhost:5173",
    },
    fileParallelism: false,
  },
});
