#!/usr/bin/env bash
set -euo pipefail

COMMON_VARIANT="MAIN"
ENVNAME="${1:-sandbox}"
FW_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CUSTOMER_ROOT="$(cd "$FW_ROOT/.." && pwd)"
CFG="$CUSTOMER_ROOT/config/$ENVNAME.properties"

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
  [ -f "$1" ] || { echo "  (ingen tests)"; return; }
  while IFS= read -r name; do
    [[ -z "${name// }" || "$name" == \#* ]] && continue
    printf "  [RUN] %s\n" "$name"
  done < "$1"
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