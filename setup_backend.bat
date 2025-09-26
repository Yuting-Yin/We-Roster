@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    We-Roster Backend One-Click Setup
echo ========================================
echo.

:: Check if running from correct directory
if not exist "backend" (
    echo ERROR: This script must be run from the We-Roster root directory
    echo Please navigate to the We-Roster folder and run this script again
    pause
    exit /b 1
)

:: Check if Java is installed
echo [1/6] Checking Java installation...
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo.
    echo Please install Java 17 or higher:
    echo - Download from: https://adoptium.net/
    echo - Or use: winget install EclipseAdoptium.Temurin.17.JDK
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Java is installed
)

:: Check if MySQL is running
echo.
echo [2/6] Checking MySQL connection...
mysql -u root -proot -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Cannot connect to MySQL with default credentials (root/root)
    echo.
    echo Please ensure MySQL is installed and running:
    echo - Download from: https://dev.mysql.com/downloads/mysql/
    echo - Or use Docker: docker run --name mysql-weroster -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0
    echo.
    echo If MySQL is running with different credentials, please update:
    echo - backend/src/main/resources/application.yaml
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "!continue!"=="y" (
        pause
        exit /b 1
    )
) else (
    echo ✓ MySQL connection successful
)

:: Create database if it doesn't exist
echo.
echo [3/6] Setting up database...
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS weroster;" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
) else (
    echo ✓ Database 'weroster' created/verified
)

:: Run database schema
echo.
echo [4/6] Running database schema...
if exist "DataBase\Database.sql" (
    mysql -u root -proot weroster < "DataBase\Database.sql" >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Failed to run database schema
        echo This might be normal if tables already exist
    ) else (
        echo ✓ Database schema applied
    )
) else (
    echo WARNING: Database.sql not found, skipping schema setup
    echo Tables will be created automatically by Spring Boot
)

:: Build the backend
echo.
echo [5/6] Building backend application...
cd backend
call gradlew.bat clean build -x test >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to build backend
    echo Please check the error messages above
    pause
    exit /b 1
) else (
    echo ✓ Backend built successfully
)

:: Start the backend
echo.
echo [6/6] Starting backend server...
echo.
echo ========================================
echo    Backend is starting...
echo ========================================
echo.
echo The backend will be available at: http://localhost:8080
echo Health check: http://localhost:8080/api/v1/health
echo.
echo Test credentials:
echo - Domain: test
echo - Email: sarah.johnson@weroster.com
echo - Password: hello
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the application
call gradlew.bat bootRun

:: If we get here, the application stopped
echo.
echo Backend server stopped.
pause
