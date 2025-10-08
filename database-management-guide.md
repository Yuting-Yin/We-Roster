# Database Management Guide

## 🗄️ Managing Your Remote Database

Once you have your remote database set up, you can manage data directly without rebuilding the database each time.

### 📊 Database Management Tools

#### Option 1: MySQL Workbench (Recommended)
1. Download from [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Create new connection with your remote database details
3. Connect and manage tables, data, and schema

#### Option 2: phpMyAdmin (Web-based)
1. Many hosting providers include phpMyAdmin
2. Access via web browser
3. User-friendly interface for database management

#### Option 3: DBeaver (Free & Cross-platform)
1. Download from [DBeaver](https://dbeaver.io/)
2. Supports MySQL and many other databases
3. Professional database management features

#### Option 4: Command Line (MySQL Client)
```bash
# Connect to your database
mysql -h your-host -P 3306 -u your-username -p your-database

# Run SQL commands
USE your-database;
SELECT * FROM users;
INSERT INTO users (domain, email, password_hash, status) VALUES ('test', 'user@example.com', 'hash', 'ACTIVE');
```

### 🔧 Common Database Operations

#### Adding Test Data
```sql
-- Add a new user
INSERT INTO users (domain, role, email, password_hash, status, created_time) 
VALUES ('test', 'USER', 'test@example.com', 'hashed_password', 'ACTIVE', NOW());

-- Add a hospital
INSERT INTO hospital (name, code, address) 
VALUES ('Test Hospital', 'TH001', '123 Main St, Test City');

-- Add staff
INSERT INTO staff (hospital_id, first_name, last_name, email, status, created_time) 
VALUES (1, 'John', 'Doe', 'john@example.com', 'Active', NOW());
```

#### Viewing Data
```sql
-- View all users
SELECT * FROM users;

-- View all staff
SELECT s.*, h.name as hospital_name 
FROM staff s 
JOIN hospital h ON s.hospital_id = h.id;

-- View shifts with details
SELECT s.*, d.name as dept_name, l.name as location_name 
FROM shift s 
LEFT JOIN dept d ON s.dept_id = d.id 
LEFT JOIN location l ON s.location_id = l.id;
```

#### Updating Data
```sql
-- Update user status
UPDATE users SET status = 'ACTIVE' WHERE email = 'user@example.com';

-- Update shift status
UPDATE shift SET status = 'INCOMPLETE' WHERE id = 1;
```

#### Deleting Data
```sql
-- Delete specific records (be careful!)
DELETE FROM users WHERE email = 'old@example.com';

-- Clear all test data
DELETE FROM notification;
DELETE FROM open_shift_request;
DELETE FROM shift_designation_requirements;
DELETE FROM open_shift;
DELETE FROM shift_swap;
DELETE FROM leave_request;
DELETE FROM shift_assignment;
DELETE FROM shift;
DELETE FROM staff_department;
DELETE FROM staff;
DELETE FROM dept;
DELETE FROM location;
DELETE FROM designation;
DELETE FROM users;
DELETE FROM hospital;
```

### 🔄 Application Configuration

#### For Development (Local Database)
```yaml
# application.yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/weroster_local?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: create-drop
com.weroster.config.DataInitializer.enabled: true
```

#### For Production (Remote Database)
```yaml
# application-prod.yaml
spring:
  datasource:
    url: jdbc:mysql://your-remote-host:3306/your-database?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: your-username
    password: your-password
  jpa:
    hibernate:
      ddl-auto: validate
com.weroster.config.DataInitializer.enabled: false
```

### 🚀 Running with Different Configurations

#### Local Development (with test data)
```bash
cd backend
./gradlew bootRun
```

#### Production Mode (remote database, no test data)
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=prod'
```

### 🔒 Security Best Practices

1. **Use strong passwords** for database accounts
2. **Enable SSL** for remote connections
3. **Limit database access** to specific IP addresses
4. **Regular backups** of your database
5. **Use environment variables** for sensitive configuration

### 📝 Environment Variables (Recommended)

Create a `.env` file in your backend directory:
```env
DB_HOST=your-remote-host
DB_PORT=3306
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
```

Then update your application.yaml to use environment variables:
```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_USER}
    password: ${DB_PASSWORD}
```

This way, you don't commit sensitive credentials to your repository.
