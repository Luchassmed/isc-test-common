#!/usr/bin/env bash
set -euo pipefail

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

FW_VERSION="$(cat "$FW_ROOT/VERSION")"

echo "=================================================="
echo " Framework version : $FW_VERSION"
echo " Miljoe            : $ENVNAME"
echo " Tenant URL        : ${CFGV[tenant_url]:-}"
echo " Source ID         : ${CFGV[source_id]:-}"
echo " Platform version  : ${CFGV[platform_version]:-}"
echo "=================================================="

gate() {
  local name="$1" req="${2:-}" want="true" val
  if [ -z "$req" ]; then printf "  [RUN ] %s\n" "$name"; return; fi
  if [[ "$req" == -* ]]; then want="false"; req="${req#-}"; fi
  val="${CFGV[feature_$req]:-false}"
  if [ "$val" = "$want" ]; then
    printf "  [RUN ] %-28s (feature %s=%s)\n" "$name" "$req" "$val"
  else
    printf "  [SKIP] %-28s (feature %s=%s)\n" "$name" "$req" "$val"
  fi
}

run_manifest() {
  [ -f "$1" ] || { echo "  (ingen tests)"; return; }
  while IFS='|' read -r name req; do
    [[ -z "${name// }" || "$name" == \#* ]] && continue
    gate "${name// }" "${req// }"
  done < "$1"
}

echo; echo "--- Faelles tests (common) ---"
run_manifest "$FW_ROOT/tests/manifest.txt"
echo; echo "--- Kundespecifikke tests (kunde-repo) ---"
run_manifest "$CUSTOMER_ROOT/tests/manifest.txt"
echo