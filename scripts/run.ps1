# Tynd wrapper: sender alle argumenter videre til runneren.
# Eksempel: .\scripts\run.ps1 --config ..\config\prod.json --kunde-rod ..
node (Join-Path $PSScriptRoot "..\runner\index.js") @args
exit $LASTEXITCODE
