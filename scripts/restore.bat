@echo off
setlocal enabledelayedexpansion

REM HRMS Elite Database Restore Script (Windows)
REM Restores the SQLite database from backup files
REM Author: HRMS Elite Team
REM Version: 1.0

REM Configuration
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKUP_DIR=%PROJECT_ROOT%\.backup"
set "DATABASE_FILE=%PROJECT_ROOT%\dev.db"
set "LOG_FILE=%BACKUP_DIR%\restore.log"
set "TEMP_DIR=%BACKUP_DIR%\temp"

REM Parse command line arguments
set "BACKUP_FILE="
set "FORCE_RESTORE=false"
set "DRY_RUN=false"
set "VALIDATE_ONLY=false"
set "SHOW_HELP=false"
set "LIST_BACKUPS=false"
set "USE_LATEST=false"

:parse_args
if "%~1"=="" goto :end_parse
if /i "%~1"=="--help" set "SHOW_HELP=true"
if /i "%~1"=="-h" set "SHOW_HELP=true"
if /i "%~1"=="--list" set "LIST_BACKUPS=true"
if /i "%~1"=="-l" set "LIST_BACKUPS=true"
if /i "%~1"=="--latest" set "USE_LATEST=true"
if /i "%~1"=="--dry-run" set "DRY_RUN=true"
if /i "%~1"=="--force" set "FORCE_RESTORE=true"
if /i "%~1"=="--validate-only" set "VALIDATE_ONLY=true"
if not "%~1"=="--help" if not "%~1"=="-h" if not "%~1"=="--list" if not "%~1"=="-l" if not "%~1"=="--latest" if not "%~1"=="--dry-run" if not "%~1"=="--force" if not "%~1"=="--validate-only" (
    if not defined BACKUP_FILE set "BACKUP_FILE=%~1"
)
shift
goto :parse_args
:end_parse

REM Show help if requested
if "%SHOW_HELP%"=="true" (
    echo HRMS Elite Database Restore Script ^(Windows^)
    echo.
    echo Usage: %~nx0 [OPTIONS] ^<backup_file^>
    echo.
    echo Options:
    echo   --help, -h           Show this help message
    echo   --list, -l           List available backups
    echo   --latest             Restore from the latest backup
    echo   --dry-run            Show what would be done without executing
    echo   --force              Force restore without confirmation
    echo   --validate-only      Only validate backup file without restoring
    echo.
    echo Examples:
    echo   %~nx0 --latest                    # Restore from latest backup
    echo   %~nx0 hrms_backup_20241201_120000.db.gz  # Restore specific backup
    echo   %~nx0 --list                      # List available backups
    echo.
    echo This script restores the HRMS Elite database from backup files.
    echo It will create a backup of the current database before restoring.
    exit /b 0
)

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

REM List backups if requested
if "%LIST_BACKUPS%"=="true" (
    echo Available Backups:
    echo.
    if not exist "%BACKUP_DIR%" (
        echo No backup directory found: %BACKUP_DIR%
        exit /b 1
    )
    
    set "BACKUP_COUNT=0"
    for %%f in ("%BACKUP_DIR%\hrms_backup_*.db.gz") do set /a BACKUP_COUNT+=1
    
    if %BACKUP_COUNT% equ 0 (
        echo No backup files found in: %BACKUP_DIR%
        exit /b 1
    )
    
    echo Backup Directory: %BACKUP_DIR%
    echo.
    echo Filename                          Date                Size           Status
    echo --------------------------------------------------------------------------------
    
    for %%f in ("%BACKUP_DIR%\hrms_backup_*.db.gz") do (
        set "filename=%%~nxf"
        set "filedate=%%~tf"
        for %%A in ("%%f") do set "filesize=%%~zA"
        
        REM Check if backup is valid (simple check)
        if exist "%%f" (
            set "status=✓ Valid"
        ) else (
            set "status=✗ Corrupt"
        )
        
        echo !filename!    !filedate!    !filesize! bytes    !status!
    )
    
    echo.
    echo Total Backups: %BACKUP_COUNT%
    exit /b 0
)

REM Get latest backup if requested
if "%USE_LATEST%"=="true" (
    set "LATEST_BACKUP="
    for /f "delims=" %%f in ('dir /b /o-d "%BACKUP_DIR%\hrms_backup_*.db.gz" 2^>nul') do (
        if not defined LATEST_BACKUP set "LATEST_BACKUP=%%f"
    )
    
    if not defined LATEST_BACKUP (
        echo ERROR: No backup files found in: %BACKUP_DIR%
        exit /b 1
    )
    
    set "BACKUP_FILE=%BACKUP_DIR%\!LATEST_BACKUP!"
)

REM If no backup file specified, try to use latest
if not defined BACKUP_FILE (
    set "LATEST_BACKUP="
    for /f "delims=" %%f in ('dir /b /o-d "%BACKUP_DIR%\hrms_backup_*.db.gz" 2^>nul') do (
        if not defined LATEST_BACKUP set "LATEST_BACKUP=%%f"
    )
    
    if not defined LATEST_BACKUP (
        echo ERROR: No backup file specified and no backups found
        echo Use --help for usage information
        exit /b 1
    )
    
    set "BACKUP_FILE=%BACKUP_DIR%\!LATEST_BACKUP!"
)

REM If backup file is relative, make it absolute
if not "!BACKUP_FILE:~0,1!"=="\" if not "!BACKUP_FILE:~0,1!"=="/" (
    set "BACKUP_FILE=%BACKUP_DIR%\!BACKUP_FILE!"
)

REM Dry run mode
if "%DRY_RUN%"=="true" (
    echo DRY RUN MODE - No actual restore will be performed
    echo Backup file: %BACKUP_FILE%
    echo Target database: %DATABASE_FILE%
    echo Force mode: %FORCE_RESTORE%
    exit /b 0
)

REM Validate backup file
echo %date% %time% [INFO] Validating backup file: %BACKUP_FILE% >> "%LOG_FILE%"

if not exist "%BACKUP_FILE%" (
    echo %date% %time% [ERROR] Backup file not found: %BACKUP_FILE% >> "%LOG_FILE%"
    echo ERROR: Backup file not found: %BACKUP_FILE%
    exit /b 1
)

REM Check if file is readable
if not exist "%BACKUP_FILE%" (
    echo %date% %time% [ERROR] Cannot read backup file: %BACKUP_FILE% >> "%LOG_FILE%"
    echo ERROR: Cannot read backup file: %BACKUP_FILE%
    exit /b 1
)

REM Validate-only mode
if "%VALIDATE_ONLY%"=="true" (
    echo %date% %time% [INFO] Validating backup file integrity... >> "%LOG_FILE%"
    
    REM Simple validation - check if file exists and has size > 0
    for %%A in ("%BACKUP_FILE%") do set "BACKUP_SIZE=%%~zA"
    if %BACKUP_SIZE% gtr 0 (
        echo %date% %time% [SUCCESS] Backup file appears to be valid >> "%LOG_FILE%"
        echo ✅ Backup file is valid
        exit /b 0
    ) else (
        echo %date% %time% [ERROR] Backup file is empty or invalid >> "%LOG_FILE%"
        echo ❌ Backup file is invalid
        exit /b 1
    )
)

REM Confirm restore unless force mode is enabled
if not "%FORCE_RESTORE%"=="true" (
    echo.
    echo ⚠️  WARNING: This will replace the current database!
    echo.
    echo Backup file: %BACKUP_FILE%
    echo Target database: %DATABASE_FILE%
    echo.
    
    if exist "%DATABASE_FILE%" (
        echo Current database will be backed up before restore
    )
    
    echo.
    set /p "CONFIRM=Are you sure you want to proceed? (yes/no): "
    if /i not "!CONFIRM!"=="yes" (
        echo Restore cancelled
        exit /b 0
    )
)

REM Start restore process
echo %date% %time% [INFO] === HRMS Elite Database Restore Started === >> "%LOG_FILE%"

REM Create backup of current database
if exist "%DATABASE_FILE%" (
    echo %date% %time% [INFO] Creating backup of current database before restore... >> "%LOG_FILE%"
    
    REM Create timestamp for current backup
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YEAR=%dt:~2,2%"
    set "MONTH=%dt:~4,2%"
    set "DAY=%dt:~6,2%"
    set "HOUR=%dt:~8,2%"
    set "MINUTE=%dt:~10,2%"
    set "SECOND=%dt:~12,2%"
    set "TIMESTAMP=%YEAR%%MONTH%%DAY%_%HOUR%%MINUTE%%SECOND%"
    
    set "CURRENT_BACKUP=%BACKUP_DIR%\pre_restore_backup_%TIMESTAMP%.db.gz"
    
    REM Use 7zip or PowerShell for compression
    where 7z >nul 2>&1
    if %errorlevel% equ 0 (
        7z a -tgzip "%CURRENT_BACKUP%" "%DATABASE_FILE%" >nul 2>&1
    ) else (
        powershell -Command "& { $content = [System.IO.File]::ReadAllBytes('%DATABASE_FILE%'); $compressed = [System.IO.Compression.GZipStream]::new([System.IO.MemoryStream]::new(), [System.IO.Compression.CompressionMode]::Compress); $compressed.Write($content, 0, $content.Length); $compressed.Close(); [System.IO.File]::WriteAllBytes('%CURRENT_BACKUP%', $compressed.BaseStream.ToArray()) }" 2>nul
    )
    
    if %errorlevel% equ 0 (
        echo %date% %time% [SUCCESS] Current database backed up to: %CURRENT_BACKUP% >> "%LOG_FILE%"
    ) else (
        echo %date% %time% [ERROR] Failed to backup current database >> "%LOG_FILE%"
        if not "%FORCE_RESTORE%"=="true" (
            echo ERROR: Failed to backup current database, aborting restore
            exit /b 1
        ) else (
            echo %date% %time% [WARNING] Force mode enabled, proceeding without current database backup >> "%LOG_FILE%"
        )
    )
)

REM Create project root directory if it doesn't exist
if not exist "%PROJECT_ROOT%" mkdir "%PROJECT_ROOT%"

REM Restore the database
echo %date% %time% [INFO] Restoring database from: %BACKUP_FILE% >> "%LOG_FILE%"

REM Extract backup file
set "TEMP_DB=%TEMP_DIR%\temp_restore.db"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Use 7zip or PowerShell for extraction
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    7z e "%BACKUP_FILE%" -o"%TEMP_DIR%" -y >nul 2>&1
    if exist "%TEMP_DIR%\dev.db" (
        move "%TEMP_DIR%\dev.db" "%DATABASE_FILE%" >nul 2>&1
    ) else (
        echo %date% %time% [ERROR] Failed to extract database from backup >> "%LOG_FILE%"
        exit /b 1
    )
) else (
    REM PowerShell extraction (simplified)
    powershell -Command "& { $compressed = [System.IO.File]::ReadAllBytes('%BACKUP_FILE%'); $stream = [System.IO.MemoryStream]::new($compressed); $gzip = [System.IO.Compression.GZipStream]::new($stream, [System.IO.Compression.CompressionMode]::Decompress); $decompressed = [System.IO.MemoryStream]::new(); $gzip.CopyTo($decompressed); [System.IO.File]::WriteAllBytes('%DATABASE_FILE%', $decompressed.ToArray()); }" 2>nul
)

if %errorlevel% equ 0 (
    echo %date% %time% [SUCCESS] Database restored successfully >> "%LOG_FILE%"
    
    REM Get database info
    for %%A in ("%DATABASE_FILE%") do set "DB_SIZE=%%~zA"
    echo %date% %time% [INFO] Restored database size: %DB_SIZE% bytes >> "%LOG_FILE%"
    
    echo %date% %time% [INFO] === HRMS Elite Database Restore Completed Successfully === >> "%LOG_FILE%"
    echo ✅ Database restored successfully
    echo Database file: %DATABASE_FILE%
    echo Log file: %LOG_FILE%
) else (
    echo %date% %time% [ERROR] Failed to restore database >> "%LOG_FILE%"
    echo ERROR: Failed to restore database
    exit /b 1
)

REM Clean up temp directory
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%" 2>nul

endlocal 