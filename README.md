# isc-test-common

Det fælles repo. Her ligger den kode PwC vedligeholder ét sted og genbruger på tværs
af kunder. Det trækkes ind i hvert kunderepo som et git-submodule i mappen `common/`.

Common indeholder **ingen kundedata og kender ikke kundens navn**. Kunderepoet
leverer værdierne:

```
kunde-a/
  config/*.properties   ← kundens miljøværdier (tenant_url, ...)
  .env                  ← credentials, ikke committet
  tests/manifest.txt    ← kundespecifikke tests
  common/                ← dette repo
    run.sh  run.bat
```

Det er den ene kobling hele modellen hviler på: **koden kommer fra PwC, værdierne
kommer fra kunden.** Skal en ny kunde på, opretter man et nyt kunderepo — common er
uændret.

## Kørsel

Fra kunderepoets rod (ikke herfra — se "Branch-skift" nedenfor):

```sh
./run.sh sandbox     # macOS / Linux
run.bat sandbox      # Windows
```

## Brug som submodule

```sh
git submodule add -b main https://github.com/Luchassmed/isc-test-common.git common
git add common .gitmodules && git commit -m "Tilføj common som submodule (branch main)"
```

Kunderepoet peger på en **branch** af dette repo (`main` eller `sandbox`), ikke en fast
commit — leverandøren ruller ændringer ud på sandbox nogle dage før pre-prod/prod, og
koden her skal kunne følge med.

Ved native/Windows Server-kørsel sker branch-skiftet automatisk: kunderepoets
`run.bat`/`run.sh` (root-niveau, ikke dem herinde i `common/`) kalder `git fetch` +
`git checkout` på `common/` ud fra miljø-argumentet — se `kunde-a`s README for
detaljer. Ved Docker/GitHub Actions styres det stadig manuelt via `branch = ...` i
kundens `.gitmodules`:

```sh
git submodule sync -- common
git submodule update --init --remote common
```

## Docker

`Dockerfile` ligger her, men skal bygges med **kunderepoets rod** som context (ikke
denne mappe), fordi `run.sh` forventer `config/` og `tests/` ét niveau op:

```sh
docker build -f common/Dockerfile -t isc-test-runner .
docker run --rm isc-test-runner sandbox
```

Da Dockerfilen ligger i `common/`, følger den automatisk med ind i alle kunderepos via
submodulet — den skal ikke duplikeres per kunde.

## Playwright

- **`tests/smoke.spec.js`** — uautentificeret. Åbner `TENANT_URL` og verificerer at
  tenanten svarer og loader en titel. Beviser kun netværksadgang.
- **`tests/login.spec.js`** — logger ind med `ISC_USERNAME`/`ISC_PASSWORD`
  (miljøvariabler, aldrig fra `.properties`) og tjekker at login-formularen forsvinder.
  Springes automatisk over (`test.skip`), hvis credentials ikke er sat.
- **`playwright.config.js`** dækker testene ovenfor. **`playwright.customer.config.js`**
  kører i stedet kunderepoets `tests/` (styret af `tests/manifest.txt`) — se
  `kunde-a`s README for hvordan credentials sættes op.

Kør lokalt uden Docker (kræver Node) — fra kunderepoets rod:

```sh
common/setup.sh        # én gang: installerer Playwright + browsere
./run.sh sandbox        # fra kunderepoets rod, ikke fra common/
```
