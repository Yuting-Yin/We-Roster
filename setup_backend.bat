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
echo Testing MySQL connection with different methods...

:: Try different MySQL connection methods
set mysql_connected=0

:: Find MySQL executable
set mysql_exe=
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set mysql_exe="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
) else if exist "C:\Program Files\MySQL\MySQL Server 9.4\bin\mysql.exe" (
    set mysql_exe="C:\Program Files\MySQL\MySQL Server 9.4\bin\mysql.exe"
) else (
    set mysql_exe=mysql
)

:: Method 1: Try with -proot (no space)
%mysql_exe% -u root -proot -e "SELECT 1;" >nul 2>&1
if not errorlevel 1 (
    set mysql_connected=1
    set mysql_cmd=%mysql_exe% -u root -proot
    echo ✓ MySQL connection successful (method 1: -proot)
    goto :mysql_success
)

:: Method 2: Try with -p root (with space)
%mysql_exe% -u root -p root -e "SELECT 1;" >nul 2>&1
if not errorlevel 1 (
    set mysql_connected=1
    set mysql_cmd=%mysql_exe% -u root -p root
    echo ✓ MySQL connection successful (method 2: -p root)
    goto :mysql_success
)

:: Method 3: Try without password
%mysql_exe% -u root -e "SELECT 1;" >nul 2>&1
if not errorlevel 1 (
    set mysql_connected=1
    set mysql_cmd=%mysql_exe% -u root
    echo ✓ MySQL connection successful (method 3: no password)
    goto :mysql_success
)

:: Method 4: Try with different ports
for %%p in (3306 3307 3308) do (
    %mysql_exe% -u root -proot -P %%p -e "SELECT 1;" >nul 2>&1
    if not errorlevel 1 (
        set mysql_connected=1
        set mysql_cmd=%mysql_exe% -u root -proot -P %%p
        echo ✓ MySQL connection successful (port %%p)
        goto :mysql_success
    )
)

:: If all methods fail, ask user to continue
echo WARNING: Cannot connect to MySQL with any standard method
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
set mysql_cmd=%mysql_exe% -u root -proot
goto :mysql_continue

:mysql_success
echo.

:mysql_continue

:: Create database if it doesn't exist
echo.
echo [3/6] Setting up database...
!mysql_cmd! -e "CREATE DATABASE IF NOT EXISTS weroster;" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to create database
    echo Trying alternative method...
    %mysql_exe% -u root -p -e "CREATE DATABASE IF NOT EXISTS weroster;" >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Still failed to create database
        echo Please create the database manually:
        echo %mysql_exe% -u root -p
        echo CREATE DATABASE IF NOT EXISTS weroster;
        echo exit;
        pause
        exit /b 1
    ) else (
        echo ✓ Database 'weroster' created/verified (alternative method)
    )
) else (
    echo ✓ Database 'weroster' created/verified
)

:: Run database schema
echo.
echo [4/6] Running database schema...
if exist "DataBase\Database.sql" (
    !mysql_cmd! weroster < "DataBase\Database.sql" >nul 2>&1
    if errorlevel 1 (
        echo WARNING: Failed to run database schema with primary method
        echo Trying alternative method...
        %mysql_exe% -u root -p weroster < "DataBase\Database.sql" >nul 2>&1
        if errorlevel 1 (
            echo WARNING: Failed to run database schema
            echo This might be normal if tables already exist
            echo Tables will be created automatically by Spring Boot
        ) else (
            echo ✓ Database schema applied (alternative method)
        )
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
echo Building backend (this may take a few minutes)...
call gradlew.bat clean build -x test
if errorlevel 1 (
    echo ERROR: Failed to build backend
    echo Please check the error messages above
    echo.
    echo Common solutions:
    echo - Check if Java 17+ is installed
    echo - Check if all dependencies are available
    echo - Try running: gradlew.bat clean build -x test
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
