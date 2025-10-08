#!/bin/bash

# Remote Database Setup Script
# This script helps you configure the application to use a remote database

echo "🌐 We-Roster Remote Database Setup"
echo "=================================="
echo ""

# Function to update application.yaml with remote database details
setup_remote_db() {
    echo "📝 Setting up remote database configuration..."
    
    read -p "Enter your remote database host: " DB_HOST
    read -p "Enter your remote database port (default 3306): " DB_PORT
    DB_PORT=${DB_PORT:-3306}
    
    read -p "Enter your database name: " DB_NAME
    read -p "Enter your username: " DB_USER
    read -s -p "Enter your password: " DB_PASSWORD
    echo ""
    
    # Create a backup of the current application.yaml
    cp backend/src/main/resources/application.yaml backend/src/main/resources/application.yaml.backup
    
    # Update application.yaml with remote database settings
    cat > backend/src/main/resources/application.yaml << EOF
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate  # Don't auto-create tables in production
    show-sql: false  # Disable SQL logging
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: false
    open-in-view: false

# Disable data initialization for remote database
spring.sql.init.mode: never
com.weroster.config.DataInitializer.enabled: false

# Logging configuration
logging:
  level:
    com.weroster: INFO
    org.springframework.security: WARN
    org.hibernate: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

# Application specific settings
app:
  data-initialization:
    enabled: false
EOF

    echo "✅ Configuration updated successfully!"
    echo "📁 Backup saved as: backend/src/main/resources/application.yaml.backup"
}

# Function to deploy database schema
deploy_schema() {
    echo "🗄️ Deploying database schema..."
    
    read -p "Do you want to deploy the database schema now? (y/n): " DEPLOY_SCHEMA
    
    if [[ $DEPLOY_SCHEMA == "y" || $DEPLOY_SCHEMA == "Y" ]]; then
        echo "Please run the following command to deploy the schema:"
        echo "mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < deploy-database-schema.sql"
        echo ""
        echo "Or use a database management tool like MySQL Workbench, phpMyAdmin, or DBeaver."
    fi
}

# Function to test connection
test_connection() {
    echo "🔍 Testing database connection..."
    
    # Check if mysql client is available
    if command -v mysql &> /dev/null; then
        echo "Testing connection with mysql client..."
        mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;" ${DB_NAME} 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Database connection successful!"
        else
            echo "❌ Database connection failed. Please check your credentials."
        fi
    else
        echo "⚠️ MySQL client not found. Please test the connection manually."
    fi
}

# Main menu
echo "Choose an option:"
echo "1. Setup remote database configuration"
echo "2. Deploy database schema"
echo "3. Test database connection"
echo "4. Exit"
echo ""

read -p "Enter your choice (1-4): " CHOICE

case $CHOICE in
    1)
        setup_remote_db
        ;;
    2)
        deploy_schema
        ;;
    3)
        test_connection
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete! You can now run your application with:"
echo "cd backend && ./gradlew bootRun"
echo ""
echo "📚 For more information, see: remote-database-setup.md"
