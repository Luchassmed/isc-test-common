// Fælles hjælpere til ISC-UI'en. Kundetests importerer herfra i stedet for at kende selectors.
// Udelukkende her ændres koden, når SailPoint ændrer UI'en (sandbox-branch = nyeste UI).
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
// Nyt request-UI (ngar): /ui/d/request-center redirecter til .../ngar/request-access/for-self
async function requestAccess(page, itemName) {
  await page.goto('/ui/d/request-center');
  await page.getByTestId('ngar-search-input').fill(itemName);
  await page.getByTestId('ngar-search-input').press('Enter');

  await expect(page.getByRole('button', { name: `View details for ${itemName}` })).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/for-self\/cart/);

  await page.getByRole('button', { name: 'Submit Request' }).click();
  await expect(page).toHaveURL(/for-self\/success/, { timeout: 30000 });
  await expect(page.getByText('Request Submitted')).toBeVisible();
}

module.exports = { test, expect, login, requestAccess };
