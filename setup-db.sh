#!/bin/bash

echo "Setting up PostgreSQL database and user..."

# Create database user and database
sudo -u postgres psql << PSQL
-- Drop existing user and database if they exist (optional)
DROP DATABASE IF EXISTS qa_platform;
DROP USER IF EXISTS "user";

-- Create user
CREATE USER "user" WITH PASSWORD 'password';

-- Create database
CREATE DATABASE qa_platform;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE qa_platform TO "user";
ALTER USER "user" CREATEDB;

-- Connect to the database and grant schema privileges
\c qa_platform
GRANT ALL ON SCHEMA public TO "user";

\q
PSQL

echo "Database setup complete!"
echo "User: user"
echo "Password: password"
echo "Database: qa_platform"
