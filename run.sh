#!/bin/sh
# ------------------------------------------------------------------
#  Ligger i common (det fælles repo) og kaldes fra kunderepoet:
#      common/run.sh
#
#  Common kender ikke kundens navn. Den leder efter en .properties-fil
#  i det repo den er submodule i, og læser værdierne derfra.
# ------------------------------------------------------------------

# Mappen som dette script ligger i, ét niveau op = kunderepoets rod.
KUNDEROD=$(cd "$(dirname "$0")/.." && pwd)

PROPS=$(ls "$KUNDEROD"/*.properties 2>/dev/null | head -1)
if [ -z "$PROPS" ]; then
  echo "FEJL: fandt ingen .properties-fil i $KUNDEROD"
  exit 1
fi

# Hent én værdi ud af propertyfilen. '#' er kommentar.
hent() { grep "^$1=" "$PROPS" | cut -d= -f2-; }

echo ""
echo "  Kundefil:    $PROPS"
echo "  kunde:       $(hent kunde)"
echo "  tenant_url:  $(hent tenant_url)"
echo ""
echo "  Her ville testene køre mod $(hent tenant_url)"
echo ""
