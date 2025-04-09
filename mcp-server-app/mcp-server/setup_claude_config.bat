@echo off
echo Setting up Claude Desktop configuration...

REM Define paths
set SOURCE_CONFIG="%~dp0config\claude_desktop_config.json"
set DEST_DIR="%APPDATA%\Claude"
set DEST_CONFIG="%APPDATA%\Claude\claude_desktop_config.json"

echo Source config: %SOURCE_CONFIG%
echo Destination: %DEST_CONFIG%

REM Create the Claude directory if it doesn't exist
if not exist %DEST_DIR% (
    echo Creating Claude directory...
    mkdir %DEST_DIR%
)

REM Check if source file exists
if not exist %SOURCE_CONFIG% (
    echo ERROR: Source configuration file not found at %SOURCE_CONFIG%
    echo Current directory is: %CD%
    echo Batch file directory is: %~dp0
    goto ERROR
)

echo Copying configuration file...
copy %SOURCE_CONFIG% %DEST_CONFIG%

if %ERRORLEVEL% EQU 0 (
    echo Configuration file copied successfully!
    echo Please restart Claude Desktop to apply the changes.
) else (
    echo Failed to copy configuration file.
    echo Source: %SOURCE_CONFIG%
    echo Destination: %DEST_CONFIG%
    goto ERROR
)

goto END

:ERROR
echo.
echo Troubleshooting:
echo 1. Make sure the file exists at: %~dp0config\claude_desktop_config.json
echo 2. Check if you have write permissions to %DEST_DIR%
echo 3. Try running this script as administrator

:END
pause