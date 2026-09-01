import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync("/bin/chromium") ? "/bin/chromium" : undefined);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 1800 },
        launchOptions: chromiumExecutable ? { executablePath: chromiumExecutable } : undefined,
      },
    },
  ],
});