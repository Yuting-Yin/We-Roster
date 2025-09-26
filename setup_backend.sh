#!/bin/bash

# We-Roster Backend One-Click Setup Script
# For Linux/macOS

set -e  # Exit on any error

echo "========================================"
echo "   We-Roster Backend One-Click Setup"
echo "========================================"
echo

# Check if running from correct directory
if [ ! -d "backend" ]; then
    echo "ERROR: This script must be run from the We-Roster root directory"
    echo "Please navigate to the We-Roster folder and run this script again"
    exit 1
fi

# Check if Java is installed
echo "[1/6] Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo
    echo "Please install Java 17 or higher:"
    echo "- Ubuntu/Debian: sudo apt install openjdk-17-jdk"
    echo "- macOS: brew install openjdk@17"
    echo "- Or download from: https://adoptium.net/"
    exit 1
else
    echo "✓ Java is installed"
    java -version
fi

# Check if MySQL is running
echo
echo "[2/6] Checking MySQL connection..."
echo "Testing MySQL connection with different methods..."

# Find MySQL executable
MYSQL_EXE="mysql"
if command -v mysql &> /dev/null; then
    MYSQL_EXE="mysql"
elif [ -f "/usr/bin/mysql" ]; then
    MYSQL_EXE="/usr/bin/mysql"
elif [ -f "/usr/local/bin/mysql" ]; then
    MYSQL_EXE="/usr/local/bin/mysql"
fi

# Try different MySQL connection methods
MYSQL_CONNECTED=0

# Method 1: Try with -proot (no space)
if $MYSQL_EXE -u root -proot -e "SELECT 1;" &> /dev/null; then
    MYSQL_CONNECTED=1
    MYSQL_CMD="$MYSQL_EXE -u root -proot"
    echo "✓ MySQL connection successful (method 1: -proot)"
fi

# Method 2: Try with -p root (with space)
if [ $MYSQL_CONNECTED -eq 0 ] && $MYSQL_EXE -u root -p root -e "SELECT 1;" &> /dev/null; then
    MYSQL_CONNECTED=1
    MYSQL_CMD="$MYSQL_EXE -u root -p root"
    echo "✓ MySQL connection successful (method 2: -p root)"
fi

# Method 3: Try without password
if [ $MYSQL_CONNECTED -eq 0 ] && $MYSQL_EXE -u root -e "SELECT 1;" &> /dev/null; then
    MYSQL_CONNECTED=1
    MYSQL_CMD="$MYSQL_EXE -u root"
    echo "✓ MySQL connection successful (method 3: no password)"
fi

# Method 4: Try with different ports
if [ $MYSQL_CONNECTED -eq 0 ]; then
    for port in 3306 3307 3308; do
        if $MYSQL_EXE -u root -proot -P $port -e "SELECT 1;" &> /dev/null; then
            MYSQL_CONNECTED=1
            MYSQL_CMD="$MYSQL_EXE -u root -proot -P $port"
            echo "✓ MySQL connection successful (port $port)"
            break
        fi
    done
fi

# If all methods fail, ask user to continue
if [ $MYSQL_CONNECTED -eq 0 ]; then
    echo "WARNING: Cannot connect to MySQL with any standard method"
    echo
    echo "Please ensure MySQL is installed and running:"
    echo "- Ubuntu/Debian: sudo apt install mysql-server"
    echo "- macOS: brew install mysql"
    echo "- Or use Docker: docker run --name mysql-weroster -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0"
    echo
    echo "If MySQL is running with different credentials, please update:"
    echo "- backend/src/main/resources/application.yaml"
    echo
    read -p "Continue anyway? (y/N): " continue
    if [[ ! "$continue" =~ ^[Yy]$ ]]; then
        exit 1
    fi
    MYSQL_CMD="$MYSQL_EXE -u root -proot"
fi

echo

# Create database if it doesn't exist
echo
echo "[3/6] Setting up database..."
if $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS weroster;" &> /dev/null; then
    echo "✓ Database 'weroster' created/verified"
else
    echo "ERROR: Failed to create database"
    echo "Trying alternative method..."
    if $MYSQL_EXE -u root -p -e "CREATE DATABASE IF NOT EXISTS weroster;" &> /dev/null; then
        echo "✓ Database 'weroster' created/verified (alternative method)"
    else
        echo "ERROR: Still failed to create database"
        echo "Please create the database manually:"
        echo "$MYSQL_EXE -u root -p"
        echo "CREATE DATABASE IF NOT EXISTS weroster;"
        echo "exit;"
        exit 1
    fi
fi

# Run database schema
echo
echo "[4/6] Running database schema..."
if [ -f "DataBase/Database.sql" ]; then
    if $MYSQL_CMD weroster < "DataBase/Database.sql" &> /dev/null; then
        echo "✓ Database schema applied"
    else
        echo "WARNING: Failed to run database schema with primary method"
        echo "Trying alternative method..."
        if $MYSQL_EXE -u root -p weroster < "DataBase/Database.sql" &> /dev/null; then
            echo "✓ Database schema applied (alternative method)"
        else
            echo "WARNING: Failed to run database schema"
            echo "This might be normal if tables already exist"
            echo "Tables will be created automatically by Spring Boot"
        fi
    fi
else
    echo "WARNING: Database.sql not found, skipping schema setup"
    echo "Tables will be created automatically by Spring Boot"
fi

# Build the backend
echo
echo "[5/6] Building backend application..."
cd backend
echo "Building backend (this may take a few minutes)..."
if ./gradlew clean build -x test; then
    echo "✓ Backend built successfully"
else
    echo "ERROR: Failed to build backend"
    echo "Please check the error messages above"
    echo
    echo "Common solutions:"
    echo "- Check if Java 17+ is installed"
    echo "- Check if all dependencies are available"
    echo "- Try running: ./gradlew clean build -x test"
    exit 1
fi

# Start the backend
echo
echo "[6/6] Starting backend server..."
echo
echo "========================================"
echo "   Backend is starting..."
echo "========================================"
echo
echo "The backend will be available at: http://localhost:8080"
echo "Health check: http://localhost:8080/api/v1/health"
echo
echo "Test credentials:"
echo "- Domain: test"
echo "- Email: sarah.johnson@weroster.com"
echo "- Password: hello"
echo
echo "Press Ctrl+C to stop the server"
echo

# Start the application
./gradlew bootRun
