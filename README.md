# isc-test-common

Det fælles repo. Her ligger den kode PwC vedligeholder ét sted og genbruger på tværs
af kunder. Det trækkes ind i hvert kunderepo som et git-submodule.

```
run.sh    Læser kundens .properties-fil og bruger værdierne.
run.bat   Det samme, til Windows.
```

## Pointen

Common indeholder **ingen kundedata og kender ikke kundens navn**. Når scriptet kører,
kigger det ét niveau op — ud i det kunderepo det er submodule i — og finder den
`.properties`-fil der ligger der:

```
kunde-a/
  kunde-a.properties     ← kundens værdier, fx tenant_url
  common/                ← dette repo
    run.sh  run.bat      ← læser filen ovenover
```

Det er den ene kobling hele modellen hviler på: **koden kommer fra PwC, værdierne
kommer fra kunden.** Skal en ny kunde på, opretter man et nyt kunderepo med deres
egen `.properties`-fil — common er uændret.

## Kørsel

Fra kunderepoets rod:

```sh
common/run.sh          # macOS / Linux
common\run.bat         # Windows
```

## Brug som submodule

```sh
git submodule add -b main https://github.com/Luchassmed/isc-test-common.git common
git add common .gitmodules && git commit -m "Tilføj common som submodule (branch main)"
```

Kunderepoet peger på en **branch** af dette repo (`main` eller `sandbox`), ikke en fast
commit. Miljøet styres ved at ændre `branch = ...` i kundens `.gitmodules` og køre:

```sh
git submodule sync -- common
git submodule update --init --remote common
```

## Docker

`Dockerfile` ligger her, men skal bygges med **kunderepoets rod** som context (ikke
denne mappe), fordi `run.sh` forventer `config/` og `tests/` ét niveau op. Fra
kunderepoets rod:

```sh
docker build -f common/Dockerfile -t isc-test-runner .
docker run --rm isc-test-runner sandbox
```

Da Dockerfilen ligger i `common/`, følger den automatisk med ind i alle kunderepos via
submodulet — den skal ikke duplikeres per kunde.

## Playwright

`tests/smoke.spec.js` er en uautentificeret smoke-test: den åbner `tenant_url` fra
kundens `.properties`-fil og verificerer at siden svarer og loader en titel. Ingen
credentials involveret — den beviser kun at miljøet (lokalt, container eller CI) kan nå
tenanten over nettet.

`tests/login.spec.js` logger faktisk ind med `ISC_USERNAME`/`ISC_PASSWORD`. Disse
kommer **aldrig** fra en `.properties`-fil (den er committet til git) — de skal sættes
som miljøvariabler uden for repoet, fx:

```powershell
$env:ISC_USERNAME = "..."
$env:ISC_PASSWORD = "..."
common\run.bat sandbox
```

Er de ikke sat, springes login-testen automatisk over (`test.skip`) i stedet for at
fejle. I GitHub Actions sættes de som repo-secrets (`ISC_USERNAME`, `ISC_PASSWORD`) og
sendes ind i containeren via `docker create -e`.

`run.sh`/`run.bat` eksporterer `tenant_url` som `TENANT_URL` og kalder
`npx playwright test`. Kør lokalt uden Docker (kræver Node):

```sh
npm install --prefix common
common/run.sh sandbox
```
