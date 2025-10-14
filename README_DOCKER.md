# Taekwondo Club Management - Docker Setup

## 🐳 Cấu hình Docker cho MySQL

### 1. Khởi động Docker Container

```bash
# Khởi động MySQL và phpMyAdmin
docker-compose up -d

# Xem logs
docker-compose logs -f mysql

# Dừng containers
docker-compose down

# Dừng và xóa volumes (cẩn thận - sẽ mất dữ liệu)
docker-compose down -v
```

### 2. Kết nối MySQL Workbench

#### Thông tin kết nối:
- **Host**: `localhost`
- **Port**: `3306`
- **Username**: `taekwondo_user` hoặc `root`
- **Password**: `taekwondo_pass123` hoặc `rootpassword123`
- **Database**: `taekwondo_club`

#### Các bước kết nối:
1. Mở MySQL Workbench
2. Click "New Connection" (+)
3. Điền thông tin:
   - Connection Name: `Taekwondo Club DB`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `taekwondo_user`
   - Password: `taekwondo_pass123`
4. Click "Test Connection"
5. Click "OK" để lưu

### 3. Import Database Schema

Sau khi kết nối thành công:

1. Mở file `taekwondo_club_database.sql`
2. Copy toàn bộ nội dung
3. Trong MySQL Workbench:
   - Chọn database `taekwondo_club`
   - Mở tab "Query"
   - Paste SQL script
   - Click "Execute" (⚡)

### 4. Truy cập phpMyAdmin

- URL: http://localhost:8080
- Username: `root`
- Password: `rootpassword123`

### 5. Kiểm tra kết nối

```sql
-- Kiểm tra database
SHOW DATABASES;

-- Kiểm tra tables
USE taekwondo_club;
SHOW TABLES;

-- Kiểm tra sample data
SELECT * FROM clubs;
SELECT * FROM users;
SELECT * FROM belt_levels;
```

### 6. Troubleshooting

#### Lỗi kết nối:
```bash
# Kiểm tra container status
docker ps

# Kiểm tra logs
docker-compose logs mysql

# Restart container
docker-compose restart mysql
```

#### Reset database:
```bash
# Dừng và xóa volumes
docker-compose down -v

# Khởi động lại
docker-compose up -d
```

### 7. Backup & Restore

#### Backup:
```bash
# Backup database
docker exec taekwondo_mysql mysqldump -u root -prootpassword123 taekwondo_club > backup.sql
```

#### Restore:
```bash
# Restore database
docker exec -i taekwondo_mysql mysql -u root -prootpassword123 taekwondo_club < backup.sql
```

## 📁 Cấu trúc thư mục

```
Taek/
├── docker-compose.yml          # Docker configuration
├── database.env               # Environment variables
├── taekwondo_club_database.sql # Database schema
├── init/
│   └── 01-init-database.sql   # Initialization script
├── mysql_config/
│   └── custom.cnf             # MySQL configuration
└── README_DOCKER.md           # This file
```

## 🔧 Environment Variables

Các biến môi trường trong `database.env`:

- `DB_HOST`: localhost
- `DB_PORT`: 3306
- `DB_DATABASE`: taekwondo_club
- `DB_USERNAME`: taekwondo_user
- `DB_PASSWORD`: taekwondo_pass123
- `DB_ROOT_PASSWORD`: rootpassword123

## 🚀 Quick Start

1. **Khởi động Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Kết nối MySQL Workbench:**
   - Host: localhost:3306
   - User: taekwondo_user
   - Password: taekwondo_pass123

3. **Import schema:**
   - Mở `taekwondo_club_database.sql`
   - Execute trong MySQL Workbench

4. **Kiểm tra:**
   ```sql
   SELECT * FROM clubs;
   ```

## 📝 Notes

- Database sẽ tự động tạo khi container khởi động lần đầu
- Dữ liệu được lưu trong Docker volume `mysql_data`
- phpMyAdmin có sẵn tại http://localhost:8080
- Tất cả tables và sample data sẽ được tạo tự động
