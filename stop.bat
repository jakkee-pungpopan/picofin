@echo off
title NovaBank - Stop
cd /d "%~dp0"
echo Stopping NovaBank services...
docker compose down
echo.
echo NovaBank stopped. Your data is kept for next time.
echo (To wipe all demo data too, run:  docker compose down -v)
echo.
pause
