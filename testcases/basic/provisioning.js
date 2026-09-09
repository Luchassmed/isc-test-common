// Test case: verificér at adgangen faktisk blev provisioneret ud i målsystemet.

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  id: 'provisioning',
  navn: 'Verificér provisionering',
  version: '1.0.0',
  severity: 'medium',
  forventet_varighed_ms: 3000,

  async run(ctx) {
    if (!ctx.mock) return { status: 'skipped', trin: [], note: 'Kun implementeret som mock i denne demo.' };

    await pause(260);
    return {
      status: 'pass',
      trin: ['Afvent provisioning-job', 'Slå bruger op i målsystemet', 'Rettigheden "FIN-READ" er til stede'],
    };
  },
};
