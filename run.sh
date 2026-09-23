#!/usr/bin/env bash
set -euo pipefail

ENVNAME="${1:-sandbox}"
FW_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CUSTOMER_ROOT="$(cd "$FW_ROOT/.." && pwd)"
CFG="$CUSTOMER_ROOT/config/$ENVNAME.properties"

COMMON_VARIANT="$(git -C "$FW_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "ukendt (ingen .git i image)")"

[ -f "$CFG" ] || { echo "[FEJL] Konfiguration ikke fundet: $CFG"; exit 1; }

declare -A CFGV
while IFS='=' read -r k v; do
  [[ -z "${k// }" || "$k" == \#* ]] && continue
  CFGV["${k// }"]="${v// }"
done < "$CFG"

echo "=================================================="
echo " Common branch     : $COMMON_VARIANT"
echo " Miljoe            : $ENVNAME"
echo " Tenant URL        : ${CFGV[tenant_url]:-}"
echo " Source ID         : ${CFGV[source_id]:-}"
echo " Platform version  : ${CFGV[platform_version]:-}"
echo "=================================================="

run_manifest() {
  local manifest="$1"
  if [ ! -f "$manifest" ]; then
    echo "  (ingen tests i manifest.txt)"
    return 0
  fi

  local files=()
  while IFS= read -r name; do
    [[ -z "${name// }" || "$name" == \#* ]] && continue
    files+=("$name")
  done < "$manifest"

  if [ "${#files[@]}" -eq 0 ]; then
    echo "  (ingen tests i manifest.txt)"
    return 0
  fi

  # tests/ i kunde-repoet har ingen egen node_modules - "@playwright/test" findes
  # kun under common/node_modules, saa den skal saettes eksplicit via NODE_PATH.
  (cd "$FW_ROOT" && NODE_PATH="$FW_ROOT/node_modules" npx playwright test --config=playwright.customer.config.js "${files[@]}")
}

export TENANT_URL="${CFGV[tenant_url]:-}"
export SOURCE_ID="${CFGV[source_id]:-}"
export PLATFORM_VERSION="${CFGV[platform_version]:-}"

# Credentials kommer fra en lokal .env (aldrig committet), ikke fra .properties.
ENV_FILE="$CUSTOMER_ROOT/.env"
if [ -f "$ENV_FILE" ]; then
  while IFS='=' read -r k v; do
    k="${k// }"
    [[ -z "$k" || "$k" == \#* ]] && continue
    export "$k=${v// }"
  done < "$ENV_FILE"
fi

echo; echo "--- Playwright tests (common) ---"
(cd "$FW_ROOT" && npx playwright test)

echo; echo "--- Kundespecifikke tests (kunde-repo) ---"
run_manifest "$CUSTOMER_ROOT/tests/manifest.txt"
echo