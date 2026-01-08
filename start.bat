@echo off
REM Start script for PDO Data Transposition TPS module_4
REM This script starts both the frontend and backend servers

echo ========================================
echo Starting PDO Data Transposition
echo ========================================
echo.

REM Check if node_modules exists (dependencies installed)
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run install.bat first.
    pause
    exit /b 1
)

REM Check if backend dependencies are installed
if not exist "backend\__pycache__" (
    echo WARNING: Python dependencies may not be installed.
    echo If you encounter errors, run install.bat first.
    echo.
)

echo Starting application...
echo Frontend will be available at http://localhost:5173
echo Backend will be available at http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.

call npm run dev

