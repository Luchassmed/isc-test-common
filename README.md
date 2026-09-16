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
