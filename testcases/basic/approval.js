// Test case: en godkender godkender en ventende adgangsanmodning.
//
// VERSION 1.0.0 — kender kun det gamle godkendelsesflow, hvor "Godkend" er ét klik.
// Kører den mod en ISC-release hvor SailPoint har indført et ekstra bekræftelsestrin,
// fejler den. Det er præcis den situation frameworket findes for at opdage.

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  id: 'approval',
  navn: 'Godkend adgangsanmodning',
  version: '1.0.0',
  severity: 'high',
  forventet_varighed_ms: 2500,

  async run(ctx) {
    if (!ctx.mock) return { status: 'skipped', trin: [], note: 'Kun implementeret som mock i denne demo.' };

    await pause(200);
    const trin = ['Åbn indbakke', 'Vælg anmodning REQ-1042', 'Klik "Godkend"'];

    if (ctx.isc_release >= '2026.10') {
      return {
        status: 'fail',
        trin,
        note: '"Godkend" åbnede en bekræftelsesdialog som testen ikke kender. Anmodningen står stadig som afventende. Ligner en ændring i ISC.',
      };
    }

    return { status: 'pass', trin: trin.concat('Status blev "Godkendt"') };
  },
};
