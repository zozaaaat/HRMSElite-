@echo off
setlocal enabledelayedexpansion

REM HRMS Elite Database Backup Script (Windows)
REM Runs every 6 hours to backup the SQLite database
REM Author: HRMS Elite Team
REM Version: 1.0

REM Configuration
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKUP_DIR=%PROJECT_ROOT%\.backup"
set "DATABASE_FILE=%PROJECT_ROOT%\dev.db"
set "LOG_FILE=%BACKUP_DIR%\backup.log"
set "MAX_BACKUPS=24"
set "COMPRESSION_LEVEL=9"

REM Create timestamp for backup file
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YEAR=%dt:~2,2%"
set "MONTH=%dt:~4,2%"
set "DAY=%dt:~6,2%"
set "HOUR=%dt:~8,2%"
set "MINUTE=%dt:~10,2%"
set "SECOND=%dt:~12,2%"
set "TIMESTAMP=%YEAR%%MONTH%%DAY%_%HOUR%%MINUTE%%SECOND%"

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo %date% %time% [INFO] Created backup directory: %BACKUP_DIR% >> "%LOG_FILE%"
)

REM Check if database exists
if not exist "%DATABASE_FILE%" (
    echo %date% %time% [ERROR] Database file not found: %DATABASE_FILE% >> "%LOG_FILE%"
    echo ERROR: Database file not found: %DATABASE_FILE%
    exit /b 1
)

REM Check if database is readable
if not exist "%DATABASE_FILE%" (
    echo %date% %time% [ERROR] Cannot read database file: %DATABASE_FILE% >> "%LOG_FILE%"
    echo ERROR: Cannot read database file: %DATABASE_FILE%
    exit /b 1
)

REM Start backup process
echo %date% %time% [INFO] === HRMS Elite Backup Started === >> "%LOG_FILE%"
echo %date% %time% [INFO] Starting backup process... >> "%LOG_FILE%"
echo %date% %time% [INFO] Database: %DATABASE_FILE% >> "%LOG_FILE%"

set "BACKUP_FILE=%BACKUP_DIR%\hrms_backup_%TIMESTAMP%.db.gz"

REM Check if 7zip is available for compression
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    REM Use 7zip for compression
    echo %date% %time% [INFO] Using 7zip for compression >> "%LOG_FILE%"
    7z a -tgzip -mx%COMPRESSION_LEVEL% "%BACKUP_FILE%" "%DATABASE_FILE%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo %date% %time% [SUCCESS] Backup created successfully: %BACKUP_FILE% >> "%LOG_FILE%"
        echo %date% %time% [INFO] Verifying backup integrity... >> "%LOG_FILE%"
        7z t "%BACKUP_FILE%" >nul 2>&1
        if %errorlevel% equ 0 (
            echo %date% %time% [SUCCESS] Backup integrity verified >> "%LOG_FILE%"
        ) else (
            echo %date% %time% [ERROR] Backup integrity check failed >> "%LOG_FILE%"
            del "%BACKUP_FILE%" 2>nul
            exit /b 1
        )
    ) else (
        echo %date% %time% [ERROR] Failed to create backup with 7zip >> "%LOG_FILE%"
        exit /b 1
    )
) else (
    REM Use PowerShell for compression (fallback)
    echo %date% %time% [INFO] Using PowerShell for compression >> "%LOG_FILE%"
    powershell -Command "& { $content = [System.IO.File]::ReadAllBytes('%DATABASE_FILE%'); $compressed = [System.IO.Compression.GZipStream]::new([System.IO.MemoryStream]::new(), [System.IO.Compression.CompressionMode]::Compress); $compressed.Write($content, 0, $content.Length); $compressed.Close(); [System.IO.File]::WriteAllBytes('%BACKUP_FILE%', $compressed.BaseStream.ToArray()) }" 2>nul
    if %errorlevel% equ 0 (
        echo %date% %time% [SUCCESS] Backup created successfully: %BACKUP_FILE% >> "%LOG_FILE%"
    ) else (
        echo %date% %time% [ERROR] Failed to create backup with PowerShell >> "%LOG_FILE%"
        exit /b 1
    )
)

REM Get backup file size
for %%A in ("%BACKUP_FILE%") do set "BACKUP_SIZE=%%~zA"
echo %date% %time% [INFO] Backup size: %BACKUP_SIZE% bytes >> "%LOG_FILE%"

REM Rotate old backups
echo %date% %time% [INFO] Checking for old backups to rotate... >> "%LOG_FILE%"

REM Count existing backups
set "BACKUP_COUNT=0"
for %%f in ("%BACKUP_DIR%\hrms_backup_*.db.gz") do set /a BACKUP_COUNT+=1

if %BACKUP_COUNT% gtr %MAX_BACKUPS% (
    set "FILES_TO_REMOVE=%BACKUP_COUNT%"
    set /a FILES_TO_REMOVE-=%MAX_BACKUPS%
    echo %date% %time% [INFO] Removing %FILES_TO_REMOVE% old backup(s)... >> "%LOG_FILE%"
    
    REM Remove oldest backups (simple approach - remove files older than 6 days)
    forfiles /p "%BACKUP_DIR%" /m "hrms_backup_*.db.gz" /d -6 /c "cmd /c del @path" 2>nul
    echo %date% %time% [INFO] Old backups removed >> "%LOG_FILE%"
) else (
    echo %date% %time% [INFO] No old backups to remove (current: %BACKUP_COUNT%, max: %MAX_BACKUPS%) >> "%LOG_FILE%"
)

REM Create backup summary
set "SUMMARY_FILE=%BACKUP_DIR%\backup_summary.txt"
echo HRMS Elite Database Backup Summary > "%SUMMARY_FILE%"
echo Generated: %date% %time% >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo Backup Directory: %BACKUP_DIR% >> "%SUMMARY_FILE%"
echo Database File: %DATABASE_FILE% >> "%SUMMARY_FILE%"
echo Max Backups Kept: %MAX_BACKUPS% >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"

REM List current backups
echo Current Backups: >> "%SUMMARY_FILE%"
for %%f in ("%BACKUP_DIR%\hrms_backup_*.db.gz") do (
    echo   %%~tf - %%~nxf >> "%SUMMARY_FILE%"
)

echo. >> "%SUMMARY_FILE%"
echo Total Backups: %BACKUP_COUNT% >> "%SUMMARY_FILE%"

REM Get total backup directory size
for /f "tokens=3" %%a in ('dir "%BACKUP_DIR%" /-c ^| find "File(s)"') do set "TOTAL_SIZE=%%a"
echo Total Size: %TOTAL_SIZE% bytes >> "%SUMMARY_FILE%"

echo %date% %time% [INFO] Backup summary created: %SUMMARY_FILE% >> "%LOG_FILE%"

REM Check disk space
for /f "tokens=3" %%a in ('dir "%PROJECT_ROOT%" /-c ^| find "bytes free"') do set "FREE_SPACE=%%a"
echo %date% %time% [INFO] Available disk space: %FREE_SPACE% bytes >> "%LOG_FILE%"

REM Final success message
echo %date% %time% [INFO] === HRMS Elite Backup Completed Successfully === >> "%LOG_FILE%"
echo ✅ Backup completed successfully
echo Backup file: %BACKUP_FILE%
echo Log file: %LOG_FILE%

endlocal 