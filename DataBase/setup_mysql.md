# MySQL Database Setup Guide

## Prerequisites
- MySQL Server installed on your machine
- MySQL running on port 3308 (or update backend config)

## Step 1: Install MySQL
If you don't have MySQL installed:

### Windows:
1. Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. Set root password as `root` (or update backend config)

### Alternative (Using Docker):
```bash
docker run --name mysql-weroster -e MYSQL_ROOT_PASSWORD=root -p 3308:3306 -d mysql:8.0
```

## Step 2: Create Database and User

### Connect to MySQL:
```bash
mysql -u root -p -P 3308 -h localhost
# Enter password: root
```

### Create Database:
```sql
CREATE DATABASE weroster;
USE weroster;
```

## Step 3: Run Database Schema

### Execute the Database.sql file:
```bash
mysql -u root -p -P 3308 -h localhost weroster < Database.sql
```

Or manually copy and paste the content from `Database.sql` into MySQL client.

## Step 4: Verify Setup

### Check if tables were created:
```sql
USE weroster;
SHOW TABLES;
```

### Check if test user was created:
```sql
SELECT domain, email, role, status FROM Users;
```

You should see:
```
+----------------+------------------------+-------+--------+
| domain         | email                  | role  | status |
+----------------+------------------------+-------+--------+
| weroster.local | admin@weroster.local   | ADMIN | ACTIVE |
+----------------+------------------------+-------+--------+
```

## Test User Credentials

Use these credentials to test login:
- **Domain**: `weroster.local`
- **Email**: `admin@weroster.local`
- **Password**: `ChangeMe123!`

## Troubleshooting

### Port Issues:
If port 3308 is not available, you can:
1. Use default port 3306 and update `backend/src/main/resources/application.yaml`
2. Change the database URL from `localhost:3308` to `localhost:3306`

### Connection Issues:
- Make sure MySQL service is running
- Check firewall settings
- Verify username/password in backend config

### Database Not Found:
- Make sure you created the `weroster` database
- Check the database name in the backend config matches

## Next Steps
1. Start the backend: `./gradlew bootRun` (from backend directory)
2. Test the health endpoint: `http://localhost:8080/api/v1/health`
3. Test login with the credentials above
