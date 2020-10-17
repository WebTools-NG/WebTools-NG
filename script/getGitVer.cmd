@echo off
: Export rev to env, for the artifact
FOR /F "tokens=*" %%g IN ('git rev-parse --short HEAD') do (SET AppRev=%%g)
: Get git root directory
FOR /F "tokens=*" %%h IN ('git rev-parse --show-toplevel') do (SET root=%%h)
: get commit hash for version file 
set rev={"rev":"%AppRev%"}

: Save to version file
echo %rev% > %root%/public/version.json