@echo off
echo Starting We-Roster Backend...
cd /d "%~dp0backend"

echo.
echo Checking if Java is installed...
java -version
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 21 or higher
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot application...
gradlew.bat bootRun

pause
