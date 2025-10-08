@echo off
setlocal enabledelayedexpansion

echo 🌐 We-Roster Remote Database Setup
echo ==================================
echo.

REM Function to update application.yaml with remote database details
:setup_remote_db
echo 📝 Setting up remote database configuration...
echo.

set /p DB_HOST="Enter your remote database host: "
set /p DB_PORT="Enter your remote database port (default 3306): "
if "%DB_PORT%"=="" set DB_PORT=3306

set /p DB_NAME="Enter your database name: "
set /p DB_USER="Enter your username: "
set /p DB_PASSWORD="Enter your password: "
echo.

REM Create a backup of the current application.yaml
copy "backend\src\main\resources\application.yaml" "backend\src\main\resources\application.yaml.backup" >nul 2>&1

REM Update application.yaml with remote database settings
(
echo server:
echo   port: 8080
echo.
echo spring:
echo   datasource:
echo     url: jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME%?useSSL=true^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
echo     username: %DB_USER%
echo     password: %DB_PASSWORD%
echo     driver-class-name: com.mysql.cj.jdbc.Driver
echo.
echo   jpa:
echo     hibernate:
echo       ddl-auto: validate  # Don't auto-create tables in production
echo     show-sql: false  # Disable SQL logging
echo     properties:
echo       hibernate:
echo         dialect: org.hibernate.dialect.MySQL8Dialect
echo         format_sql: false
echo     open-in-view: false
echo.
echo # Disable data initialization for remote database
echo spring.sql.init.mode: never
echo com.weroster.config.DataInitializer.enabled: false
echo.
echo # Logging configuration
echo logging:
echo   level:
echo     com.weroster: INFO
echo     org.springframework.security: WARN
echo     org.hibernate: WARN
echo   pattern:
echo     console: "%%d{yyyy-MM-dd HH:mm:ss} - %%msg%%n"
echo.
echo # Application specific settings
echo app:
echo   data-initialization:
echo     enabled: false
) > "backend\src\main\resources\application.yaml"

echo ✅ Configuration updated successfully!
echo 📁 Backup saved as: backend\src\main\resources\application.yaml.backup
echo.
goto :main_menu

REM Function to deploy database schema
:deploy_schema
echo 🗄️ Deploying database schema...
echo.
set /p DEPLOY_SCHEMA="Do you want to deploy the database schema now? (y/n): "

if /i "%DEPLOY_SCHEMA%"=="y" (
    echo Please run the following command to deploy the schema:
    echo mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% ^< deploy-database-schema.sql
    echo.
    echo Or use a database management tool like MySQL Workbench, phpMyAdmin, or DBeaver.
)
goto :main_menu

REM Function to test connection
:test_connection
echo 🔍 Testing database connection...
echo.
echo Please test the connection manually using:
echo mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME%
echo.
echo Or use a database management tool.
goto :main_menu

REM Main menu
:main_menu
echo.
echo Choose an option:
echo 1. Setup remote database configuration
echo 2. Deploy database schema
echo 3. Test database connection
echo 4. Exit
echo.

set /p CHOICE="Enter your choice (1-4): "

if "%CHOICE%"=="1" goto setup_remote_db
if "%CHOICE%"=="2" goto deploy_schema
if "%CHOICE%"=="3" goto test_connection
if "%CHOICE%"=="4" goto end

echo ❌ Invalid choice. Please run the script again.
goto :main_menu

:end
echo.
echo 👋 Goodbye!
echo.
echo 🎉 Setup complete! You can now run your application with:
echo cd backend ^&^& .\gradlew.bat bootRun
echo.
echo 📚 For more information, see: remote-database-setup.md
pause
