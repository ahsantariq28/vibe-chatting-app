import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run tests sequentially to prevent DB state collisions
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx tsx server.ts",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      MONGODB_URI: "mongodb://localhost:27017/chatapp_test",
      NEXTAUTH_SECRET: "test-secret-key-for-nextauth-testing-123456",
      NEXTAUTH_URL: "http://localhost:3001",
      PORT: "3001",
      TEST_ENV: "true",
    },
  },
});
