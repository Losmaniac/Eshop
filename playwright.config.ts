import { defineConfig, devices } from "@playwright/test";

// End-to-end smoke test against the full (server) build with a throwaway
// SQLite database. Emails are only logged because RESEND_API_KEY is empty.
const port = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `rm -rf .data/e2e.db && npm run build && npx next start -p ${port}`,
    url: `http://localhost:${port}`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: "file:.data/e2e.db",
      BANK_IBAN: "CZ6508000000192000145399",
      BANK_ACCOUNT: "19-2000145399/0800",
      SITE_URL: `http://localhost:${port}`,
      RESEND_API_KEY: "",
    },
  },
});
