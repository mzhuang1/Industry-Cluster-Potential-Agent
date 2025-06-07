@echo off
echo 🚀 Starting screenshot automation for Windows...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to project root
cd /d "%~dp0.."

REM Check if puppeteer is installed
if not exist "node_modules\puppeteer" (
    echo 📦 Installing Puppeteer...
    npm install puppeteer --save-dev
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Puppeteer
        pause
        exit /b 1
    )
)

REM Create screenshots directory
if not exist "screenshots" mkdir screenshots

REM Run the screenshot script
echo 📸 Taking screenshots...
node scripts/take-screenshots.js

if %errorlevel% equ 0 (
    echo ✅ Screenshots completed successfully!
    echo 📁 Check the 'screenshots' folder for PNG files
) else (
    echo ❌ Screenshot process failed
)

echo.
echo Press any key to open screenshots folder...
pause >nul
explorer screenshots

exit /b 0