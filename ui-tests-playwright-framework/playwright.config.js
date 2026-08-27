const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:8080",
    headless: true,
    channel: "chrome",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off"
  },
  webServer: {
    command: "python3 -m http.server 8080 --directory ../src/main/webapp",
    url: "http://127.0.0.1:8080/HTML/landingpage.html",
    reuseExistingServer: true,
    timeout: 30_000
  }
});


