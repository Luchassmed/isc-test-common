@echo off
setlocal enabledelayedexpansion

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
set /p FW_VERSION=<"%FW_ROOT%VERSION"

echo ==================================================
echo  Framework version : !FW_VERSION!
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
for /f "usebackq eol=# tokens=1,2 delims=|" %%A in ("%~1") do call :gate "%%A" "%%B"
exit /b 0

:gate
setlocal enabledelayedexpansion
set "name=%~1"
set "req=%~2"
if "%req%"=="" ( echo   [RUN ] %name% & endlocal & exit /b 0 )
set "want=true"
if "%req:~0,1%"=="-" ( set "want=false" & set "req=%req:~1%" )
set "val=!cfg_feature_%req%!"
if "!val!"=="" set "val=false"
if /i "!val!"=="!want!" (
  echo   [RUN ] %name%      ^(feature %req%=!val!^)
) else (
  echo   [SKIP] %name%      ^(feature %req%=!val!^)
)
endlocal & exit /b 0