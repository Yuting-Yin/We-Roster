#!/bin/bash

# We-Roster Backend Docker Setup Script
# For Linux/macOS

set -e  # Exit on any error

echo "========================================"
echo "  We-Roster Backend Docker Setup"
echo "========================================"
echo

# Check if Docker is installed
echo "[1/4] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo
    echo "Please install Docker:"
    echo "- Ubuntu/Debian: sudo apt install docker.io"
    echo "- macOS: brew install docker"
    echo "- Or download from: https://www.docker.com/products/docker-desktop/"
    exit 1
else
    echo "✓ Docker is installed"
    docker --version
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "ERROR: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
else
    echo "✓ Docker is running"
fi

# Stop and remove existing containers
echo
echo "[2/4] Cleaning up existing containers..."
docker stop mysql-weroster 2>/dev/null || true
docker rm mysql-weroster 2>/dev/null || true
echo "✓ Cleaned up existing containers"

# Start MySQL container
echo
echo "[3/4] Starting MySQL container..."
docker run --name mysql-weroster \
    -e MYSQL_ROOT_PASSWORD=root \
    -e MYSQL_DATABASE=weroster \
    -p 3306:3306 \
    -d mysql:8.0

echo "✓ MySQL container started"

# Wait for MySQL to be ready
echo
echo "Waiting for MySQL to be ready..."
sleep 10

# Test MySQL connection
echo
echo "[4/4] Testing MySQL connection..."
if docker exec mysql-weroster mysql -u root -proot -e "SELECT 1;" &> /dev/null; then
    echo "✓ MySQL is ready"
else
    echo "WARNING: MySQL might not be ready yet"
    echo "Please wait a moment and try running the backend manually"
fi

echo
echo "========================================"
echo "    Docker Setup Complete!"
echo "========================================"
echo
echo "MySQL container is running:"
echo "- Host: localhost"
echo "- Port: 3306"
echo "- Database: weroster"
echo "- Username: root"
echo "- Password: root"
echo
echo "Next steps:"
echo "1. Run: ./setup_backend.sh (to start the backend)"
echo "2. Or manually: cd backend && ./gradlew bootRun"
echo
echo "To stop MySQL: docker stop mysql-weroster"
echo "To remove MySQL: docker rm mysql-weroster"
echo
