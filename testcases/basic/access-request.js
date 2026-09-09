// Test case: en bruger anmoder om adgang til en applikation.
//
// Denne test opretter data i kundens tenant (en anmodning), og rydder derfor op
// efter sig i cleanup(). Runneren kalder cleanup() uanset om run() gik godt.

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  id: 'access-request',
  navn: 'Anmod om adgang',
  version: '1.0.0',
  severity: 'high',
  forventet_varighed_ms: 2000,

  async run(ctx) {
    if (!ctx.mock) return { status: 'skipped', trin: [], note: 'Kun implementeret som mock i denne demo.' };

    await pause(180);
    return {
      status: 'pass',
      trin: ['Søg efter app "Finance Portal"', 'Vælg konto', 'Indsend anmodning', 'Anmodning fik id REQ-1042'],
    };
  },

  async cleanup(ctx) {
    if (!ctx.mock) return;
    await pause(40); // ville trække anmodningen tilbage via ISC's API
  },
};
