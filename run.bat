@echo off
REM ------------------------------------------------------------------
REM  Ligger i common (det faelles repo) og kaldes fra kunderepoet:
REM      common\run.bat
REM
REM  Common kender ikke kundens navn. Den leder efter en .properties-fil
REM  i det repo den er submodule i, og laeser vaerdierne derfra.
REM ------------------------------------------------------------------

setlocal enabledelayedexpansion

REM %~dp0 er mappen hvor denne .bat ligger, altsaa ...\kunde-a\common\
set "KUNDEROD=%~dp0.."

set "PROPS="
for %%f in ("%KUNDEROD%\*.properties") do set "PROPS=%%~ff"

if not defined PROPS (
  echo FEJL: fandt ingen .properties-fil i %KUNDEROD%
  exit /b 1
)

REM eol=# springer kommentarlinjer over, delims== deler paa lighedstegnet
for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%PROPS%") do (
  if "%%a"=="kunde"      set "KUNDE=%%b"
  if "%%a"=="tenant_url" set "TENANT_URL=%%b"
)

echo.
echo   Kundefil:    %PROPS%
echo   kunde:       !KUNDE!
echo   tenant_url:  !TENANT_URL!
echo.
echo   Her ville testene koere mod !TENANT_URL!
echo.
