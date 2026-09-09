# isc-test-common

Fælles, generisk kode til PwC's autotest-framework for SailPoint ISC.

Repoet indeholder **runneren**, **rapportformatet** og de **basale test cases** der er
ens på tværs af kunder. Det trækkes ind i hvert kunderepo som et git-submodule.

Det indeholder med vilje **ikke**: kundekonfiguration, credentials, kundespecifikke
test cases eller schedulering. Det ligger i kunderepoet.

## Indhold

```
runner/index.js        Udfører aktive test cases og skriver rapporten.
                       Indeholder ingen beslutningslogik om hvad der er en fejl.
lib/report.js          Bygger rapporten i ét fast JSON-format.
lib/testloader.js      Finder test cases i dette repo og i kunderepoet.
testcases/basic/       login, access-request, approval, provisioning
scripts/run.sh|.ps1    Tynde wrappers omkring runneren.
```

Ingen dependencies, ingen `package.json`. Ren Node (CommonJS).

## Test case-kontrakten

Alle test cases — også kundens egne — eksporterer det samme:

```js
module.exports = {
  id: 'approval',
  navn: 'Godkend adgangsanmodning',
  version: '1.0.0',
  severity: 'high',
  forventet_varighed_ms: 2500,
  async run(ctx) {
    return { status: 'pass', trin: ['...'], note: null };  // pass | fail | error | skipped
  },
  async cleanup(ctx) {},   // valgfri: kaldes altid, også efter fejl
};
```

`ctx` = `{ kunde, miljø, tenant_url, isc_release, secrets_fil, mock }`.

**Testen sætter selv sin status.** Runneren udfører, måler og rapporterer — den
vurderer ikke om resultatet er acceptabelt. Den vurdering hører hjemme hos PwC,
nedstrøms for rapporten.

## Kørsel

```sh
node runner/index.js --config <config.json> --kunde-rod <kunderepo> [--real] [--out <fil>]
```

`--mock` er default, så alt kan køre uden at installere browsere. `--real` slår
rigtig Playwright til; i denne demo er kun `login` implementeret som rigtig test, og
den springes over med `skipped` hvis `playwright` ikke er installeret.

Exit code: `0` = pass, `1` = fail, `2` = error.

## Brug som submodule

```sh
git submodule add https://github.com/Luchassmed/isc-test-common.git common
git -C common checkout v1.0.0        # pin til et tag
git add common .gitmodules && git commit -m "Pin common til v1.0.0"
```

## Versionering

**Tag ved hver ændring i testadfærd. Kunderepoet pinner et tag — aldrig en branch.**

Et kunderepo peger på præcis én commit i dette repo. Det betyder at en ændring her
først rammer kunden når kunden selv flytter sin pin. Det er dét der gør det muligt
at tilpasse test cases til en ny ISC-release i sandbox, dage før prod opdateres,
uden at prod-testene knækker.

| Tag | Indhold |
|---|---|
| `v1.0.0` | Alle fire basale test cases i deres oprindelige form. |
| `v1.1.0` | `approval.js` tilpasset det ekstra bekræftelsestrin SailPoint indførte i ISC 2026.10. |
