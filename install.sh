#!/bin/bash

# Installation script for PDO Data Transposition TPS module_4
# This script installs all required dependencies for the application

echo "========================================"
echo "PDO Data Transposition - Installation"
echo "========================================"
echo ""

# Check Python installation
echo "[1/5] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed or not in PATH"
        echo "Please install Python 3.8 or higher from https://www.python.org/downloads/"
        exit 1
    else
        PYTHON_CMD=python
    fi
else
    PYTHON_CMD=python3
fi

$PYTHON_CMD --version
echo "Python found!"
echo ""

# Check Node.js installation
echo "[2/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16 or higher from https://nodejs.org/"
    exit 1
fi
node --version
echo "Node.js found!"
echo ""

# Check npm installation
echo "[3/5] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo "npm should come with Node.js installation"
    exit 1
fi
npm --version
echo "npm found!"
echo ""

# Install Python dependencies
echo "[4/5] Installing Python dependencies..."
echo "This may take a few minutes..."
cd backend
$PYTHON_CMD -m pip install --upgrade pip
$PYTHON_CMD -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    cd ..
    exit 1
fi
cd ..
echo "Python dependencies installed successfully!"
echo ""

# Install Node.js dependencies
echo "[5/5] Installing Node.js dependencies..."
echo "This may take a few minutes..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Node.js dependencies"
    exit 1
fi
echo "Node.js dependencies installed successfully!"
echo ""

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p "backend/Excel Files"
mkdir -p "backend/Excel Files/Test Sheets"
echo "Directories created!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example.txt .env
    echo ".env file created. Please update it with your configuration."
else
    echo ".env file already exists. Skipping creation."
fi
echo ""

# Create backend/.env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOF
PORT=5000
DEBUG=True
EOF
    echo "Backend .env file created."
else
    echo "backend/.env file already exists. Skipping creation."
fi
echo ""

echo "========================================"
echo "Installation completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration (if needed)"
echo "2. Update backend/.env file with your configuration (if needed)"
echo "3. Run 'npm run dev' to start the application"
echo ""

