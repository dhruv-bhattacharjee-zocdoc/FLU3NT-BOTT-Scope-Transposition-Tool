# Installation Guide

This guide will help you install all required dependencies for the PDO Data Transposition TPS module_4 application.

## Prerequisites

Before running the installation script, ensure you have the following installed:

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **Node.js 16 or higher and npm**
   - Download from: https://nodejs.org/
   - npm comes bundled with Node.js

## Quick Installation

### Windows

1. Double-click `install.bat` or run it from Command Prompt:
   ```cmd
   install.bat
   ```

### macOS / Linux

1. Open Terminal in the project directory
2. Make the script executable (if not already):
   ```bash
   chmod +x install.sh
   ```
3. Run the installation script:
   ```bash
   ./install.sh
   ```

## Manual Installation

If you prefer to install dependencies manually:

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or using pip3:
```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Create Required Directories

**Windows:**
```cmd
mkdir backend\Excel Files
mkdir backend\Excel Files\Test Sheets
```

**macOS / Linux:**
```bash
mkdir -p backend/Excel Files
mkdir -p backend/Excel Files/Test Sheets
```

### 4. Set Up Environment Variables

1. Copy `env.example.txt` to `.env`:
   ```bash
   cp env.example.txt .env
   ```

2. Update `.env` with your configuration (if needed)

3. Create `backend/.env`:
   ```bash
   echo "PORT=5000" > backend/.env
   echo "DEBUG=True" >> backend/.env
   ```

## Dependencies

### Python Dependencies (backend/requirements.txt)

- **flask** (3.0.0) - Web framework
- **flask-cors** (4.0.0) - CORS support
- **pandas** (2.1.4) - Data processing
- **openpyxl** (3.1.2) - Excel file handling
- **xlrd** (2.0.1) - Excel file reading
- **requests** (2.31.0) - HTTP requests
- **python-dotenv** (1.0.0) - Environment variables
- **snowflake-connector-python** (3.7.0) - Snowflake database connector

### Node.js Dependencies (package.json)

**Production:**
- react (^18.2.0)
- react-dom (^18.2.0)
- lucide-react (^0.294.0)
- motion (^12.23.25)
- papaparse (^5.4.1)
- xlsx (^0.18.5)

**Development:**
- vite (^5.0.8)
- @vitejs/plugin-react (^4.2.1)
- tailwindcss (^3.3.6)
- autoprefixer (^10.4.16)
- postcss (^8.4.32)
- concurrently (^8.2.2)

## Running the Application

After installation, start the application:

```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Flask) servers concurrently.

- Frontend: http://localhost:5173 (or the port Vite assigns)
- Backend: http://localhost:5000

## Troubleshooting

### Python not found
- Make sure Python is installed and added to PATH
- Try using `python3` instead of `python` on macOS/Linux

### Node.js not found
- Make sure Node.js is installed
- Verify installation: `node --version` and `npm --version`

### Permission errors (macOS/Linux)
- Use `sudo` if needed: `sudo npm install`
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

### Snowflake connection issues
- Ensure you have the correct credentials in your environment
- Verify your Snowflake account and role permissions

### Port already in use
- Change the port in `backend/.env` file
- Or stop the process using port 5000

## Additional Notes

- The installation script will create necessary directories automatically
- Environment files (`.env`) are created from templates if they don't exist
- All dependencies are installed locally in the project directory
- For production builds, run `npm run build`

## Support

If you encounter any issues during installation, please check:
1. All prerequisites are installed correctly
2. You have internet connection for downloading packages
3. You have sufficient disk space
4. Your firewall/antivirus is not blocking the installation

