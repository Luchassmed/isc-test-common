// Fælles hjælpere til ISC-UI'en. Kundetests importerer herfra i stedet for at kende selectors.
// Udelukkende her ændres koden, når SailPoint ændrer UI'en (main = UI'et preprod/prod kører).
// Re-eksporterer test/expect, så kundetests bruger samme @playwright/test-kopi som common.
const { test, expect } = require('@playwright/test');

async function login(page) {
  test.skip(
    !process.env.ISC_USERNAME || !process.env.ISC_PASSWORD,
    'ISC_USERNAME/ISC_PASSWORD er ikke sat - springer testen over'
  );

  await page.goto('/');
  await page.fill('#username', process.env.ISC_USERNAME);
  await page.fill('#password', process.env.ISC_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page.locator('#password')).toBeHidden({ timeout: 15000 });
}

// Anmoder om adgang til et access item (rolle, entitlement m.v.) til den loggede bruger selv.
// Gammelt request-UI (Request Center med "Request for Myself"-knap).
async function requestAccess(page, itemName) {
  await page.goto('/ui/d/request-center');
  await page.getByRole('button', { name: 'Request for Myself' }).click();

  await page.getByTestId('search-bar-input').fill(itemName);
  await page.getByTestId('search-bar-input').press('Enter');
  await expect(page.getByLabel(`Select ${itemName} for request`)).toBeVisible({ timeout: 10000 });

  await page.getByLabel(`Select ${itemName} for request`).click();
  await page.getByLabel('Review and Submit 1 request').click();
  await page.getByTestId('request-review-submit-request-button').click();

  await expect(page.getByText('Your request was submitted.')).toBeVisible({ timeout: 30000 });
}

module.exports = { test, expect, login, requestAccess };
