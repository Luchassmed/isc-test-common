#!/bin/sh
# Tynd wrapper: sender alle argumenter videre til runneren.
# Eksempel: ./scripts/run.sh --config ../config/prod.json --kunde-rod ..
exec node "$(dirname "$0")/../runner/index.js" "$@"
