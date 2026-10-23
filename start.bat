@echo off
title KingEqualizer
cd /d "%~dp0"

if not exist ".env" (
  echo Missing .env file. Copy .env.example to .env and fill it in.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH. Install it from https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting KingEqualizer...
call npm start
if errorlevel 1 (
  echo.
  echo Bot exited with an error. See the message above.
)
pause