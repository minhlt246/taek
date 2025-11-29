-- Script SQL để setup database và user
-- Chạy lệnh: mysql -u root -p < scripts/setup-database.sql
-- Hoặc copy và paste vào MySQL client

-- Tạo database
CREATE DATABASE IF NOT EXISTS `taekwondo_club` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (nếu chưa tồn tại)
CREATE USER IF NOT EXISTS 'taekwondo_user'@'localhost' IDENTIFIED BY 'taekwondo_pass123';

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON `taekwondo_club`.* TO 'taekwondo_user'@'localhost';

-- Áp dụng thay đổi
FLUSH PRIVILEGES;

-- Kiểm tra
SELECT 'Database và user đã được tạo thành công!' AS message;

