@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  We-Roster Backend Docker Setup
echo ========================================
echo.

:: Check if Docker is installed
echo [1/4] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running
    echo.
    echo Please install Docker Desktop:
    echo - Download from: https://www.docker.com/products/docker-desktop/
    echo - Or use: winget install Docker.DockerDesktop
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Docker is installed
)

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
) else (
    echo ✓ Docker is running
)

:: Stop and remove existing containers
echo.
echo [2/4] Cleaning up existing containers...
docker stop mysql-weroster 2>nul
docker rm mysql-weroster 2>nul
echo ✓ Cleaned up existing containers

:: Start MySQL container
echo.
echo [3/4] Starting MySQL container...
docker run --name mysql-weroster ^
    -e MYSQL_ROOT_PASSWORD=root ^
    -e MYSQL_DATABASE=weroster ^
    -p 3306:3306 ^
    -d mysql:8.0

if errorlevel 1 (
    echo ERROR: Failed to start MySQL container
    pause
    exit /b 1
) else (
    echo ✓ MySQL container started
)

:: Wait for MySQL to be ready
echo.
echo Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

:: Test MySQL connection
echo.
echo [4/4] Testing MySQL connection...
docker exec mysql-weroster mysql -u root -proot -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo WARNING: MySQL might not be ready yet
    echo Please wait a moment and try running the backend manually
) else (
    echo ✓ MySQL is ready
)

echo.
echo ========================================
echo    Docker Setup Complete!
echo ========================================
echo.
echo MySQL container is running:
echo - Host: localhost
echo - Port: 3306
echo - Database: weroster
echo - Username: root
echo - Password: root
echo.
echo Next steps:
echo 1. Run: setup_backend.bat (to start the backend)
echo 2. Or manually: cd backend && gradlew.bat bootRun
echo.
echo To stop MySQL: docker stop mysql-weroster
echo To remove MySQL: docker rm mysql-weroster
echo.
pause
