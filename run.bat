@echo off
setlocal enabledelayedexpansion

set "ENVNAME=%~1"
if "%ENVNAME%"=="" set "ENVNAME=sandbox"

set "FW_ROOT=%~dp0"
set "CUSTOMER_ROOT=%FW_ROOT%.."
set "CFG=%CUSTOMER_ROOT%\config\%ENVNAME%.properties"

rem git -C med en sti der ender paa "\" lige foer den afsluttende " bliver
rem fejltolket (\" opfattes som et escaped anfoerselstegn) - brug en variant
rem uden den afsluttende backslash til git-kald.
set "FW_ROOT_GIT=%FW_ROOT:~0,-1%"

set "COMMON_VARIANT="
for /f "delims=" %%G in ('git -C "%FW_ROOT_GIT%" rev-parse --abbrev-ref HEAD 2^>nul') do set "COMMON_VARIANT=%%G"
if not defined COMMON_VARIANT set "COMMON_VARIANT=ukendt (ingen .git i image)"

if not exist "%CFG%" (
  echo [FEJL] Konfiguration ikke fundet: %CFG%
  exit /b 1
)

rem --- indlaes config som cfg_<key> variabler ---
for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%CFG%") do set "cfg_%%A=%%B"

echo ==================================================
echo  Common branch     : %COMMON_VARIANT%
echo  Miljoe            : %ENVNAME%
echo  Tenant URL        : !cfg_tenant_url!
echo  Source ID         : !cfg_source_id!
echo  Platform version  : !cfg_platform_version!
echo ==================================================
set "TENANT_URL=!cfg_tenant_url!"
set "SOURCE_ID=!cfg_source_id!"
set "PLATFORM_VERSION=!cfg_platform_version!"

rem --- credentials kommer fra en lokal .env (aldrig committet), ikke fra .properties ---
set "ENVFILE=%CUSTOMER_ROOT%\.env"
if exist "%ENVFILE%" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%ENVFILE%") do set "%%A=%%B"
)

echo.
echo --- Playwright tests (common) ---
pushd "%FW_ROOT%"
call npx playwright test
set "PW_EXIT=%ERRORLEVEL%"
popd
if not "%PW_EXIT%"=="0" exit /b %PW_EXIT%

echo.
echo --- Kundespecifikke tests (kunde-repo) ---
call :run_manifest "%CUSTOMER_ROOT%\tests\manifest.txt"
echo.
exit /b 0

:run_manifest
if not exist "%~1" ( echo   ^(ingen tests^) & exit /b 0 )
for /f "usebackq eol=# delims=" %%A in ("%~1") do echo   [RUN] %%A
exit /b 0