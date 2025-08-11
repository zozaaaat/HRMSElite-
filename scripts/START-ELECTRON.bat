@echo off
echo ========================================
echo    HRMS Elite - Electron Application
echo ========================================
echo.

echo Starting HRMS Elite Electron App...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo npm version:
npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Install electron dependencies if needed
if not exist "electron\node_modules" (
    echo Installing Electron dependencies...
    cd electron
    npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Electron dependencies
        pause
        exit /b 1
    )
    echo.
)

echo Starting development server and Electron app...
echo.
echo The app will open in an Electron window at http://localhost:5173
echo.
echo Press Ctrl+C to stop the application
echo.

REM Start the development server and Electron
npm run dev:electron

echo.
echo Application stopped.
pause 