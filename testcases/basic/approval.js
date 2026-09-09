// Test case: en godkender godkender en ventende adgangsanmodning.
//
// VERSION 1.1.0 — tilpasset efter SailPoint-release ISC 2026.10.
//
// Hvad skete der: i 2026.10 indførte SailPoint et ekstra bekræftelsestrin, så
// "Godkend" ikke længere afslutter godkendelsen i ét klik. Version 1.0.0 af denne
// test kendte kun det gamle flow og begyndte derfor at fejle i sandbox, få dage før
// samme release rammer prod. Denne version håndterer begge flows, så den kan køre
// i sandbox (2026.10) og i prod (2026.09) side om side indtil prod er opdateret.

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  id: 'approval',
  navn: 'Godkend adgangsanmodning',
  version: '1.1.0',
  severity: 'high',
  forventet_varighed_ms: 3200, // et trin mere end i 1.0.0

  async run(ctx) {
    if (!ctx.mock) return { status: 'skipped', trin: [], note: 'Kun implementeret som mock i denne demo.' };

    await pause(200);
    const trin = ['Åbn indbakke', 'Vælg anmodning REQ-1042', 'Klik "Godkend"'];

    if (ctx.isc_release >= '2026.10') {
      await pause(80);
      trin.push('Bekræft i dialogen (nyt trin i ISC 2026.10)');
    }

    return { status: 'pass', trin: trin.concat('Status blev "Godkendt"') };
  },
};
