@echo off
setlocal

set "FW_ROOT=%~dp0"
pushd "%FW_ROOT%"

echo Installerer Node-afhaengigheder...
call npm install
if errorlevel 1 goto :fail

echo Installerer Playwright-browsere...
call npx playwright install
if errorlevel 1 goto :fail

popd
echo.
echo Faerdig. Koer "common\run.bat <miljoe>" for at teste.
exit /b 0

:fail
popd
exit /b 1
