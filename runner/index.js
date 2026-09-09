// RUNNER
//
// Runneren indeholder INGEN beslutningslogik om hvad der er en fejl.
//
// Den læser config, udfører de test cases der er aktive for miljøet, rydder op,
// og skriver resultatet i rapportformatet. Statussen sætter test casen selv.
// Vurderingen af hvad der er acceptabelt — hvad der skal udløse en advisering til
// kunden, hvad der bare er støj — hører hjemme nedstrøms hos PwC, ikke her.
//
//   node runner/index.js --config <fil> --kunde-rod <mappe> [--real] [--out <fil>]

const fs = require('fs');
const path = require('path');
const { indlaes } = require('../lib/testloader');
const { byg, varighedBand } = require('../lib/report');

const commonRod = path.join(__dirname, '..');

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = JSON.parse(fs.readFileSync(args.config, 'utf8'));
  const kundeRod = args['kunde-rod'] || process.cwd();
  const mock = !args.real; // mock er default: demoen skal kunne køre uden browsere

  const ctx = {
    kunde: config.kunde,
    miljø: config.miljø,
    tenant_url: config.tenant_url,
    isc_release: config.isc_release,
    secrets_fil: config.secrets_fil,
    mock,
  };

  console.log(`\n  ${config.kunde} / ${config.miljø}   (ISC ${config.isc_release}, mode: ${mock ? 'mock' : 'real'})\n`);

  const { tests, manglende } = indlaes({ aktive: config.aktive_testcases, commonRod, kundeRod });
  const resultater = [];
  let cleanupFejl = 0;
  let cleanupKørt = 0;

  for (const tc of tests) {
    const start = Date.now();
    let udfald;
    try {
      udfald = await tc.run(ctx);
    } catch (e) {
      // Kastet undtagelse = 'error': testen kunne ikke gennemføres. Det er noget
      // andet end 'fail', hvor testen kørte og fandt noget galt i miljøet.
      udfald = { status: 'error', trin: [], note: e.message };
    }
    const varighed_ms = Date.now() - start;

    if (tc.cleanup) {
      cleanupKørt++;
      try {
        await tc.cleanup(ctx);
      } catch (e) {
        cleanupFejl++;
      }
    }

    resultater.push({
      id: tc.id,
      navn: tc.navn,
      version: tc.version,
      severity: tc.severity,
      status: udfald.status,
      varighed_ms,
      varighed_band: varighedBand(varighed_ms, config.taerskler_ms),
      trin: udfald.trin || [],
      note: udfald.note || null,
    });
    skrivLinje(resultater[resultater.length - 1]);
  }

  // Et id i config som ingen fil svarer til skal være synligt i rapporten,
  // ikke forsvinde i stilhed.
  for (const id of manglende) {
    resultater.push({
      id,
      navn: id,
      version: null,
      severity: null,
      status: 'error',
      varighed_ms: 0,
      varighed_band: 'ukendt',
      trin: [],
      note: 'Test case findes ikke i hverken common eller kundens testcases.',
    });
    skrivLinje(resultater[resultater.length - 1]);
  }

  const rapport = byg({
    config,
    resultater,
    cleanup_status: cleanupFejl ? 'fejlet' : cleanupKørt ? 'ok' : 'ingen',
    mock,
    commonRod,
  });

  if (args.out) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(rapport, null, 2));
    console.log(`\n  Rapport: ${args.out}`);
  }
  console.log(`  Samlet status: ${rapport.samlet_status.toUpperCase()}   (common ${rapport.common_version})\n`);

  process.exit(rapport.samlet_status === 'pass' ? 0 : rapport.samlet_status === 'fail' ? 1 : 2);
}

function skrivLinje(r) {
  const tegn = { pass: '✔', fail: '✘', error: '!', skipped: '–' }[r.status] || '?';
  console.log(`  ${tegn} ${r.id.padEnd(18)} ${String(r.varighed_ms).padStart(5)} ms  ${r.note || ''}`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const n = argv[i].replace(/^--/, '');
    args[n] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return args;
}

main();
