@echo off
title Air Quality Monitoring - Real-Time Air Quality Dashboard
color 0b

echo ====================================================
echo   Air Quality Monitoring - Real-Time Air Quality Dashboard
echo   CSE221 - Interactive Data Visualization using D3.js
echo   Author: Tellapeli Hasini (98260040005)
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Starting Air Quality Monitoring Server...
start "" "http://localhost:3000"
npm run dev

pause
