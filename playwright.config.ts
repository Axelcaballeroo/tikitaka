import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 60000,
  workers: 1,
  use: { baseURL: process.env.QA_BASE_URL || "http://localhost:3100", channel: process.env.QA_BROWSER_CHANNEL || "chrome", viewport: { width: 1440, height: 1000 }, screenshot: "only-on-failure" },
  outputDir: ".qa-private/browser-results",
  reporter: "list",
});
