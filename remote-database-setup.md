# Remote Database Setup Guide

## Option 1: Railway (Recommended - Free & Easy)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Add MySQL Database
1. Click "New" → "Database" → "MySQL"
2. Railway will automatically provision a MySQL database
3. Note down the connection details:
   - Host: `containers-us-west-xyz.railway.app`
   - Port: `3306`
   - Database: `railway`
   - Username: `root`
   - Password: (auto-generated)

### Step 3: Get Connection String
1. Go to your MySQL service
2. Click on "Connect" tab
3. Copy the connection string or individual values

## Option 2: PlanetScale (MySQL-Compatible)

### Step 1: Create Account
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Create a new database

### Step 2: Get Connection Details
1. Go to your database dashboard
2. Click "Connect"
3. Select "Node.js" to get connection string
4. Note down: host, username, password, database name

## Option 3: AWS RDS (More Complex but Scalable)

### Step 1: AWS Setup
1. Create AWS account
2. Go to RDS service
3. Create MySQL instance
4. Configure security groups for your IP

## Database Schema Deployment

Once you have your remote database, you'll need to:
1. Create the database schema using our Database.sql file
2. Update application.yaml with remote connection details
3. Disable DataInitializer for production use
4. Set up database management tools

## Next Steps
Choose your preferred option and I'll help you configure the application to use the remote database.
