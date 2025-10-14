-- Initialize Taekwondo Club Database
-- This script will be executed when MySQL container starts for the first time

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS taekwondo_club CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE taekwondo_club;

-- Grant privileges to taekwondo_user
GRANT ALL PRIVILEGES ON taekwondo_club.* TO 'taekwondo_user'@'%';
FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;
