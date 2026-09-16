@echo off
setlocal enabledelayedexpansion

set "COMMON_VARIANT=MAIN"
set "ENVNAME=%~1"
if "%ENVNAME%"=="" set "ENVNAME=sandbox"

set "FW_ROOT=%~dp0"
set "CUSTOMER_ROOT=%FW_ROOT%.."
set "CFG=%CUSTOMER_ROOT%\config\%ENVNAME%.properties"

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
echo.
echo --- Faelles tests (common) ---
call :run_manifest "%FW_ROOT%tests\manifest.txt"
echo.
echo --- Kundespecifikke tests (kunde-repo) ---
call :run_manifest "%CUSTOMER_ROOT%\tests\manifest.txt"
echo.
exit /b 0

:run_manifest
if not exist "%~1" ( echo   ^(ingen tests^) & exit /b 0 )
for /f "usebackq eol=# delims=" %%A in ("%~1") do echo   [RUN] %%A
exit /b 0