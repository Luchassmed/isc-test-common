// Rapporten har ét fast format — og det er hele pointen.
//
// Formatet afkobler runneren fra evalueringen. Runneren kan skiftes ud, test cases
// kan komme og gå, kunder kan have vidt forskellige miljøer — men modtageren hos PwC
// læser altid de samme felter. Det er dét der gør det muligt at bygge alarmering,
// historik og rapportering ovenpå uden at røre ved den kode der kører hos kunden.

const { execSync } = require('child_process');

function byg({ config, resultater, cleanup_status, mock, commonRod }) {
  const tidspunkt = new Date().toISOString();

  return {
    run_id: `${config.kunde}-${config.miljø}-${tidspunkt.replace(/[:.]/g, '-')}`,
    kunde: config.kunde,
    miljø: config.miljø,
    tidspunkt,
    common_version: commonVersion(commonRod),
    isc_release: config.isc_release,
    mode: mock ? 'mock' : 'real',
    taerskler_ms: config.taerskler_ms,
    testcases: resultater,
    samlet_status: samletStatus(resultater),
    cleanup_status,
  };
}

// Hvilken version af det fælles repo kørte vi? Aflæses direkte af git i submodulet,
// så rapporten altid kan spores tilbage til præcis den kode der blev udført.
function commonVersion(commonRod) {
  try {
    return execSync('git describe --tags --always', { cwd: commonRod, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (e) {
    return 'ukendt';
  }
}

// OBSERVATION, ikke en dom. Vi noterer hvilket bånd varigheden faldt i, men vi
// beslutter ikke om det er et problem — det gør evalueringen hos PwC.
function varighedBand(ms, taerskler) {
  if (!taerskler) return 'ukendt';
  if (ms >= taerskler.fail) return 'over_fail';
  if (ms >= taerskler.warn) return 'over_warn';
  return 'ok';
}

// Ren aggregering af de statusser test casene selv satte. Ingen egen vurdering.
function samletStatus(resultater) {
  if (resultater.some((r) => r.status === 'error')) return 'error';
  if (resultater.some((r) => r.status === 'fail')) return 'fail';
  return 'pass';
}

module.exports = { byg, varighedBand };
