# We-Roster Complete Setup Guide

## 🎯 Overview
This guide will help you set up the complete We-Roster system with MySQL database and domain-based authentication.

## 📋 Prerequisites
- Java 21 or higher
- MySQL Server
- Node.js and npm (for frontend)

## 🗄️ Step 1: MySQL Database Setup

### 1.1 Install MySQL
- Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
- Install with default settings
- Set root password as `root`
- Make sure MySQL runs on port 3308 (or update backend config)

### 1.2 Create Database
```bash
# Connect to MySQL
mysql -u root -p -P 3308 -h localhost

# Create database
CREATE DATABASE weroster;
exit
```

### 1.3 Import Database Schema
```bash
# From the project root directory
mysql -u root -p -P 3308 -h localhost weroster < DataBase/Database.sql
```

### 1.4 Verify Database Setup
```bash
mysql -u root -p -P 3308 -h localhost weroster

# Check tables
SHOW TABLES;

# Check test user
SELECT domain, email, role, status FROM Users;
```

You should see the test user:
```
+----------------+------------------------+-------+--------+
| domain         | email                  | role  | status |
+----------------+------------------------+-------+--------+
| weroster.local | admin@weroster.local   | ADMIN | ACTIVE |
+----------------+------------------------+-------+--------+
```

## 🚀 Step 2: Start Backend

### Option A: Using the batch script (Windows)
```bash
# From project root
start_backend.bat
```

### Option B: Manual start
```bash
cd backend
gradlew.bat bootRun
```

### 2.1 Verify Backend
Open http://localhost:8080/api/v1/health - should return `{"status":"UP"}`

## 📱 Step 3: Start Frontend

```bash
cd frontend
npm install
npm start
```

## 🔐 Step 4: Test Login

Use these credentials in the login screen:
- **Domain**: `weroster.local`
- **Email**: `admin@weroster.local`  
- **Password**: `ChangeMe123!`

## 🎉 Success!

If everything works correctly:
1. ✅ Login should succeed
2. ✅ You'll be redirected to the dashboard
3. ✅ My Roster page should load real data from the backend

## 🛠️ Troubleshooting

### Backend Issues
- **Port 8080 in use**: Change port in `backend/src/main/resources/application.yaml`
- **Database connection failed**: Check MySQL is running on port 3308
- **Java not found**: Install Java 21 and add to PATH

### Frontend Issues  
- **Login 404 error**: Backend not running or wrong URL
- **CORS errors**: Check backend CORS configuration
- **Network errors**: Check if backend URL is correct in `frontend/src/config/env.ts`

### Database Issues
- **Access denied**: Check MySQL username/password
- **Database not found**: Make sure `weroster` database exists
- **Table doesn't exist**: Re-run the Database.sql script

## 🔧 Configuration Files

### Backend Database Config
`backend/src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3308/weroster
    username: root
    password: root
```

### Frontend API Config  
`frontend/src/config/env.ts`:
```typescript
export const API_BASE_URL = "http://localhost:8080/api/v1";
```

## 📝 Notes

- The system now supports **domain-based authentication**
- Users are uniquely identified by **domain + email** combination
- The test user belongs to domain `weroster.local`
- Backend automatically creates staff records for valid users

## 🎯 Next Steps

1. **Add more test users** with different domains
2. **Create sample shift data** for testing
3. **Configure production database** settings
4. **Set up environment-specific configs**

Happy coding! 🚀
