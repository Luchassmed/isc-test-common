const { test, expect } = require('@playwright/test');

test('login med rigtige credentials lykkes', async ({ page }) => {
  test.skip(
    !process.env.ISC_USERNAME || !process.env.ISC_PASSWORD,
    'ISC_USERNAME/ISC_PASSWORD er ikke sat - springer login-test over'
  );

  await page.goto('/');

  await page.fill('#username', process.env.ISC_USERNAME);
  await page.fill('#password', process.env.ISC_PASSWORD);
  await page.click('button[type="submit"]');

  // Login-formularen forsvinder ved succesfuldt login; bliver #password-feltet
  // synligt, er login fejlet (forkert adgangskode, MFA-udfordring osv.)
  await expect(page.locator('#password')).toBeHidden({ timeout: 15000 });
});
