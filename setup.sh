#!/usr/bin/env bash
set -euo pipefail

FW_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$FW_ROOT"

echo "Installerer Node-afhaengigheder..."
npm install

echo "Installerer Playwright-browsere..."
npx playwright install

echo
echo "Faerdig. Koer \"common/run.sh <miljoe>\" for at teste."
