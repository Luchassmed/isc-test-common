// Test case: SSO/login mod kundens ISC-tenant.
//
// Dette er den ENESTE test der kan køre som en rigtig Playwright-test (--real).
// De øvrige er mock-only i denne demo.

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  id: 'login',
  navn: 'SSO-login til ISC',
  version: '1.0.0',
  severity: 'high',
  forventet_varighed_ms: 1500,

  async run(ctx) {
    if (!ctx.mock) return rigtigtLogin(ctx);

    await pause(120);
    return {
      status: 'pass',
      trin: ['Åbn tenant-URL', 'Redirect til IdP', 'Login', 'Landede på dashboard'],
    };
  },
};

// Opt-in: kræver at 'playwright' er installeret. Er den ikke det, springer vi over
// i stedet for at fejle — en manglende browser er ikke et fund om kundens miljø.
async function rigtigtLogin(ctx) {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (e) {
    return {
      status: 'skipped',
      trin: [],
      note: 'Playwright ikke installeret. Kør: npm i playwright && npx playwright install chromium',
    };
  }

  const browser = await chromium.launch();
  try {
    const side = await browser.newPage();
    await side.goto(ctx.tenant_url, { timeout: 15000 });
    return { status: 'pass', trin: [`Hentede ${ctx.tenant_url}`, `Titel: ${await side.title()}`] };
  } finally {
    await browser.close();
  }
}
