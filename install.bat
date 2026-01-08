@echo off
REM Installation script for PDO Data Transposition TPS module_4
REM This script installs all required dependencies for the application

echo ========================================
echo PDO Data Transposition - Installation
echo ========================================
echo.

REM Check Python installation
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo Python found!
echo.

REM Check Node.js installation
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16 or higher from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo Node.js found!
echo.

REM Check npm installation
echo [3/5] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    echo npm should come with Node.js installation
    pause
    exit /b 1
)
npm --version
echo npm found!
echo.

REM Install Python dependencies
echo [4/5] Installing Python dependencies...
echo This may take a few minutes...
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo Python dependencies installed successfully!
echo.

REM Install Node.js dependencies
echo [5/5] Installing Node.js dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo Node.js dependencies installed successfully!
echo.

REM Create necessary directories
echo Creating necessary directories...
if not exist "backend\Excel Files" mkdir "backend\Excel Files"
if not exist "backend\Excel Files\Test Sheets" mkdir "backend\Excel Files\Test Sheets"
echo Directories created!
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy env.example.txt .env >nul
    echo .env file created. Please update it with your configuration.
) else (
    echo .env file already exists. Skipping creation.
)
echo.

REM Create backend/.env if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend/.env file...
    echo PORT=5000 > backend\.env
    echo DEBUG=True >> backend\.env
    echo Backend .env file created.
) else (
    echo backend/.env file already exists. Skipping creation.
)
echo.

echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env file with your configuration (if needed)
echo 2. Update backend/.env file with your configuration (if needed)
echo 3. Run 'start.bat' or 'npm run dev' to start the application
echo.
pause

