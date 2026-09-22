const { test, expect } = require('@playwright/test');

test('tenant er naabar og login-side loader', async ({ page }) => {
  const response = await page.goto('/');

  expect(response, `Fik intet svar fra ${process.env.TENANT_URL}`).not.toBeNull();
  expect(response.ok(), `Forventede 2xx/3xx fra tenant, fik ${response.status()}`).toBeTruthy();
  await expect(page).toHaveTitle(/.+/);
});
