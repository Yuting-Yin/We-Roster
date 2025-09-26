# We-Roster Setup Guide

This guide provides one-click setup scripts for the complete We-Roster system (backend + frontend).

## Quick Start

### Prerequisites Check
Before running the setup scripts, ensure you have:

1. **Java 17+** installed and in PATH
2. **MySQL 8.0+** installed and running
3. **Root password** set to `root` (or update `application.yaml`)

**Quick verification:**
```cmd
# Check Java
java -version

# Check MySQL (Windows)
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot -e "SELECT 1;"

# Check MySQL (Linux/macOS)
mysql -u root -proot -e "SELECT 1;"
```

### Option 1: Complete Setup (Recommended)

**Windows:**
```bash
# Setup backend
.\setup_backend.bat

# Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

**Linux/macOS:**
```bash
# Setup backend
chmod +x setup_backend.sh
./setup_backend.sh

# Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

### Option 2: Docker Setup (Alternative)

If you prefer using Docker for MySQL:

**Windows:**
```bash
# Setup MySQL with Docker
setup_backend_docker.bat

# Then run the backend
setup_backend.bat

# Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

**Linux/macOS:**
```bash
# Setup MySQL with Docker
chmod +x setup_backend_docker.sh
./setup_backend_docker.sh

# Then run the backend
./setup_backend.sh

# Setup frontend (in new terminal)
cd frontend
npm install
npm start
```

## What the Setup Scripts Do

### Backend Setup
1. **Prerequisites Check**
   - ✅ Java 17+ installation
   - ✅ MySQL server availability
   - ✅ Multiple MySQL connection methods tested
   - ✅ Auto-detection of MySQL installation paths

2. **Database Setup**
   - ✅ Create `weroster` database
   - ✅ Run database schema from `DataBase/Database.sql`
   - ✅ Verify database structure
   - ✅ Fallback methods for connection issues

3. **Backend Build**
   - ✅ Clean and build Spring Boot application
   - ✅ Download dependencies
   - ✅ Compile Java code
   - ✅ Visible build output for debugging

4. **Application Start**
   - ✅ Start backend server on port 8080
   - ✅ Initialize test data via `DataInitializer.java`
   - ✅ Display connection information

### Frontend Setup
1. **Dependencies**
   - ✅ Install Node.js packages
   - ✅ Verify React Native/Expo setup

2. **Configuration**
   - ✅ Set up API endpoints
   - ✅ Configure environment variables

3. **Development Server**
   - ✅ Start Expo development server
   - ✅ Enable hot reload

### Docker Setup (Alternative)
1. **Container Management**
   - ✅ Stop existing MySQL containers
   - ✅ Start fresh MySQL 8.0 container
   - ✅ Configure database with correct credentials

2. **Connection Testing**
   - ✅ Multiple connection attempts
   - ✅ Wait for MySQL to be fully ready
   - ✅ Verify database accessibility

## MySQL Setup and Prerequisites

### MySQL Installation and Configuration

#### Windows Installation
1. **Download MySQL**
   - Go to [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - Download MySQL Community Server 8.0 or 9.4
   - Run the installer with default settings

2. **Set Root Password**
   - During installation, set root password to `root`
   - Or change it later using MySQL Workbench

3. **Verify Installation**
   ```cmd
   # Check if MySQL is installed
   dir "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
   
   # Test connection
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   # Enter password: root
   ```

#### Linux Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Set root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
exit;
```

#### macOS Installation
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Set root password
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
exit;
```

### MySQL Connection Troubleshooting

#### Common Connection Issues

**Issue 1: Multiple MySQL Installations**
```cmd
# Check for multiple MySQL installations
dir "C:\Program Files\MySQL\"

# Test each installation
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot -e "SELECT 1;"
"C:\Program Files\MySQL\MySQL Server 9.4\bin\mysql.exe" -u root -proot -e "SELECT 1;"
```

**Issue 2: MySQL Not in PATH**
```cmd
# Add MySQL to PATH (Windows)
setx PATH "%PATH%;C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Or use full path in commands
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot
```

**Issue 3: Wrong Password**
```sql
-- Connect to MySQL
mysql -u root -p
-- Enter current password when prompted

-- Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
exit;
```

**Issue 4: MySQL Service Not Running**
```cmd
# Windows - Check service status
sc query MySQL80
sc query MySQL94

# Start MySQL service
net start MySQL80
# or
net start MySQL94
```

```bash
# Linux - Check service status
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql
```

### Prerequisites for Setup Scripts

#### Stage 2: MySQL Connection Check
**Requirements:**
- MySQL server installed and running
- Root user accessible
- Password set to `root` (or update `application.yaml`)
- MySQL executable in PATH or at standard location

**Verification:**
```cmd
# Windows
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot -e "SELECT 1;"

# Linux/macOS
mysql -u root -proot -e "SELECT 1;"
```

#### Stage 3: Database Creation
**Requirements:**
- Successful MySQL connection from Stage 2
- Root user has CREATE DATABASE privileges
- No existing `weroster` database (or script will skip creation)

**Manual Database Creation:**
```sql
-- Connect to MySQL
mysql -u root -proot

-- Create database
CREATE DATABASE IF NOT EXISTS weroster;

-- Verify creation
SHOW DATABASES LIKE 'weroster';

-- Exit
exit;
```

## Manual Setup (If Scripts Fail)

### Prerequisites
1. **Java 17+**
   - Download from [Adoptium](https://adoptium.net/)
   - Or use package manager:
     - Windows: `winget install EclipseAdoptium.Temurin.17.JDK`
     - Ubuntu: `sudo apt install openjdk-17-jdk`
     - macOS: `brew install openjdk@17`

2. **MySQL 8.0+**
   - Download from [MySQL](https://dev.mysql.com/downloads/mysql/)
   - Or use Docker: `docker run --name mysql-weroster -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.0`

### Manual Steps
1. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE weroster;
   USE weroster;
   ```

2. **Run Schema**
   ```bash
   mysql -u root -p weroster < DataBase/Database.sql
   ```

3. **Build Backend**
   ```bash
   cd backend
   ./gradlew clean build
   ```

4. **Start Application**
   ```bash
   ./gradlew bootRun
   ```

## Configuration

### Database Configuration
Edit `backend/src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/weroster?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: root  # Change this to your MySQL password
```

### Server Configuration
```yaml
server:
  port: 8080
  address: 0.0.0.0
```

## Test the Setup

### 1. Health Check
```bash
curl http://localhost:8080/api/v1/health
```

### 2. Login Test
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test",
    "email": "sarah.johnson@weroster.com",
    "password": "hello"
  }'
```

### 3. Frontend Integration
Update `frontend/.env`:
```
EXPO_PUBLIC_API_BASE=http://localhost:8080/api/v1
```

### 4. Access the Application
- **Frontend:** Open Expo Go app and scan QR code
- **Backend API:** http://localhost:8080/api/v1
- **Health Check:** http://localhost:8080/api/v1/health

## Troubleshooting

### Common Issues

#### Java Not Found
```
ERROR: Java is not installed or not in PATH
```
**Solution:** Install Java 17+ and add to PATH

#### MySQL Connection Failed
```
WARNING: Cannot connect to MySQL with any standard method
```
**Solutions:**
- Check MySQL is running: `mysql -u root -p`
- Update credentials in `application.yaml`
- Use Docker setup: `setup_backend_docker.bat`
- The script now tries multiple connection methods automatically

#### Multiple MySQL Installations
```
ERROR: Failed to create database
```
**Solutions:**
- The script auto-detects MySQL 8.0 and 9.4 installations
- Uses full paths to avoid PATH issues
- Try Docker setup for clean environment
- Check which MySQL service is running: `sc query MySQL80` and `sc query MySQL94`
- Stop conflicting services: `net stop MySQL94` (keep MySQL80 running)

#### Port Already in Use
```
Port 8080 is already in use
```
**Solutions:**
- Stop other applications on port 8080
- Change port in `application.yaml`
- Use different port: `./gradlew bootRun --args="--server.port=8081"`

#### Database Schema Errors
```
Failed to run database schema
```
**Solutions:**
- Check `DataBase/Database.sql` exists
- Verify MySQL permissions
- Tables will be created automatically by Spring Boot
- Script now has fallback methods for schema import

#### Build Failures
```
ERROR: Failed to build backend
```
**Solutions:**
- Check Java 17+ is installed
- Verify all dependencies are available
- Script now shows build output for debugging
- Try manual build: `./gradlew clean build -x test`

### Logs and Debugging

#### Enable Debug Logging
Edit `application.yaml`:
```yaml
logging:
  level:
    com.weroster: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
```

#### Check Application Logs
```bash
# View logs in real-time
tail -f backend/logs/application.log
```

## Development

### Hot Reload
```bash
./gradlew bootRun --continuous
```

### Run Tests
```bash
./gradlew test
```

### Build JAR
```bash
./gradlew bootJar
```

## Production Deployment

### Environment Variables
```bash
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/weroster
export SPRING_DATASOURCE_USERNAME=your-username
export SPRING_DATASOURCE_PASSWORD=your-password
```

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY backend/build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Try the manual setup steps
5. Use Docker setup for a clean environment
6. Check that MySQL services are running properly

### Script Improvements
The setup scripts have been enhanced with:
- **Auto-detection** of MySQL installations (8.0 and 9.4)
- **Multiple connection methods** for better compatibility
- **Fallback mechanisms** for database operations
- **Visible build output** for easier debugging
- **Better error messages** with specific solutions

## Test Credentials

After successful setup, use these credentials to test:
- **Domain:** `test`
- **Email:** `sarah.johnson@weroster.com`
- **Password:** `hello`
