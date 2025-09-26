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
if ! mysql -u root -proot -e "SELECT 1;" &> /dev/null; then
    echo "WARNING: Cannot connect to MySQL with default credentials (root/root)"
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
else
    echo "✓ MySQL connection successful"
fi

# Create database if it doesn't exist
echo
echo "[3/6] Setting up database..."
if mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS weroster;" &> /dev/null; then
    echo "✓ Database 'weroster' created/verified"
else
    echo "ERROR: Failed to create database"
    exit 1
fi

# Run database schema
echo
echo "[4/6] Running database schema..."
if [ -f "DataBase/Database.sql" ]; then
    if mysql -u root -proot weroster < "DataBase/Database.sql" &> /dev/null; then
        echo "✓ Database schema applied"
    else
        echo "WARNING: Failed to run database schema"
        echo "This might be normal if tables already exist"
    fi
else
    echo "WARNING: Database.sql not found, skipping schema setup"
    echo "Tables will be created automatically by Spring Boot"
fi

# Build the backend
echo
echo "[5/6] Building backend application..."
cd backend
if ./gradlew clean build -x test &> /dev/null; then
    echo "✓ Backend built successfully"
else
    echo "ERROR: Failed to build backend"
    echo "Please check the error messages above"
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
