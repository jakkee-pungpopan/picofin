@echo off
setlocal enabledelayedexpansion
title NovaBank - Start
cd /d "%~dp0"

echo ==============================================
echo            NovaBank - Demo Banking
echo  Demo only. Not for real financial use.
echo ==============================================
echo.

REM --- 1. Check Docker is installed ---
where docker >nul 2>nul
if errorlevel 1 (
  echo [X] Docker not found.
  echo     Please install Docker Desktop from:
  echo     https://www.docker.com/products/docker-desktop
  echo     Then open Docker Desktop and run this file again.
  echo.
  pause
  exit /b 1
)

REM --- 2. Check Docker engine is running ---
docker info >nul 2>nul
if errorlevel 1 (
  echo [X] Docker Desktop is installed but not running.
  echo     Open "Docker Desktop" and wait until it says "Running",
  echo     then double-click this file again.
  echo.
  pause
  exit /b 1
)

REM --- 3. Create .env from example on first run ---
if not exist ".env" (
  echo [*] Creating .env from .env.example ...
  copy /Y ".env.example" ".env" >nul
)

REM --- 4. Build and start all services ---
echo [*] Building and starting NovaBank (first run may take a few minutes)...
echo.
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo [X] Failed to start. Scroll up to read the error,
  echo     or copy it and send it for help.
  pause
  exit /b 1
)

REM --- 5. Wait for the API to respond ---
echo.
echo [*] Waiting for the API to be ready...
set /a tries=0
:waitloop
set /a tries+=1
curl -s -o nul http://localhost:3000 >nul 2>nul
if not errorlevel 1 goto ready
if !tries! geq 40 goto timeout
timeout /t 3 >nul
goto waitloop

:timeout
echo [!] API did not respond yet. It may still be starting.
echo     You can check status with:  docker compose ps
echo     And logs with:              docker compose logs -f backend-api
goto open

:ready
echo [OK] API is ready!

:open
echo.
echo ==============================================
echo  Admin dashboard : http://localhost:3001
echo     login: admin@novabank.local / Admin@123
echo.
echo  API + Swagger   : http://localhost:3000/api/docs
echo.
echo  Mobile demo user: somchai@novabank.local
echo                    password Password@123  PIN 123456
echo ==============================================
echo.
echo Opening the admin dashboard and API docs in your browser...
start "" http://localhost:3001
start "" http://localhost:3000/api/docs
echo.
echo To stop NovaBank later, run  stop.bat
echo.
pause
