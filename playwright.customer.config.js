const { defineConfig } = require('@playwright/test');

// Bruges til at koere kundespecifikke tests (kunde-repoets tests/, styret af
// tests/manifest.txt), adskilt fra de faelles tests i common/tests/ som
// playwright.config.js daekker. Ligger i common/ (ikke i kunde-repoet), fordi
// @playwright/test kun er installeret under common/node_modules.
module.exports = defineConfig({
  testDir: '../tests',
  reporter: [['html', { open: 'never', outputFolder: 'customer-playwright-report' }]],
  use: {
    baseURL: process.env.TENANT_URL,
  },
});
