const { defineConfig } = require('@playwright/test');

// Kunde-repoets tests/. Ligger i common/, fordi @playwright/test kun er installeret her.
module.exports = defineConfig({
  testDir: '../tests',
  reporter: [['html', { open: 'never', outputFolder: 'customer-playwright-report' }]],
  use: {
    baseURL: process.env.TENANT_URL,
  },
});
