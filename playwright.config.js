const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // open: 'never' - ellers haenger en fejlet ubemandet koersel og venter paa Ctrl+C.
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.TENANT_URL,
  },
});
