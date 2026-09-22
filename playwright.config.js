const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  // open: 'never' - uden dette starter en fejlet koersel en lokal webserver og
  // venter paa Ctrl+C, hvilket haenger for evigt ved ubemandet/planlagt koersel.
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.TENANT_URL,
  },
});
