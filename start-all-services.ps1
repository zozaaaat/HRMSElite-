# HRMS Elite - Start All Services
# This script starts all versions of the HRMS Elite project

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    HRMS Elite - Starting All Services" -ForegroundColor Cyan
Write-Host "    Version 2.1.0 - Complete System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to start a service
function Start-Service {
    param(
        [string]$Name,
        [string]$Command,
        [string]$Directory = "."
    )
    
    Write-Host "[INFO] Starting $Name..." -ForegroundColor Yellow
    
    if ($Directory -ne ".") {
        $Command = "cd $Directory && $Command"
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $Command -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Start all services
Write-Host "[1/4] Starting Backend Server (Express.js)..." -ForegroundColor Green
Start-Service -Name "Backend Server" -Command "npm run dev"

Write-Host "[2/4] Starting Frontend Client (React)..." -ForegroundColor Green
Start-Service -Name "Frontend Client" -Command "npm run dev:client"

Write-Host "[3/4] Starting Mobile App (React Native/Expo)..." -ForegroundColor Green
Start-Service -Name "Mobile App" -Command "npm start" -Directory "hrms-mobile"

Write-Host "[4/4] Starting Desktop App (Electron)..." -ForegroundColor Green
Start-Service -Name "Desktop App" -Command "npm run dev" -Directory "electron"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "    All Services Started Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor White
Write-Host "• Backend API: http://localhost:3000" -ForegroundColor Yellow
Write-Host "• Frontend Web: http://localhost:5173" -ForegroundColor Yellow
Write-Host "• Mobile App: Expo DevTools" -ForegroundColor Yellow
Write-Host "• Desktop App: Electron Window" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
