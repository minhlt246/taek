# Hướng dẫn Debug Lỗi Đăng Nhập

## Vấn đề
1. Lỗi: "Invalid email/phone/username/mã hội viên or password"
2. Lỗi: "Cannot GET /auth/login" (404)

## Nguyên nhân có thể

### 1. Database chưa được cập nhật schema
- Entity Coach đã thay đổi: role từ `['head_coach', 'main_manager', 'assistant_manager', 'assistant']` → `['owner', 'admin']`
- Database có thể vẫn còn schema cũ

### 2. Backend server chưa chạy hoặc chưa restart
- Sau khi thay đổi entity, cần restart backend server
- Kiểm tra xem backend có đang chạy trên port 4000 không

### 3. Database connection issue
- Kiểm tra kết nối database
- Kiểm tra xem bảng `huan_luyen_vien` có tồn tại không

## Cách kiểm tra và sửa lỗi

### Bước 1: Kiểm tra backend server
```bash
cd api
npm run start:dev
# Hoặc
yarn start:dev
```

Kiểm tra xem server có chạy trên http://localhost:4000 không

### Bước 2: Kiểm tra database schema
Chạy SQL để kiểm tra:
```sql
DESCRIBE huan_luyen_vien;
-- Hoặc
SHOW COLUMNS FROM huan_luyen_vien;
```

Kiểm tra xem:
- Cột `role` có ENUM là `('owner', 'admin')` không
- Cột `ma_hoi_vien` có tồn tại không
- Cột `ho_va_ten` có tồn tại không

### Bước 3: Cập nhật database nếu cần
Nếu database chưa được cập nhật, chạy migration:
```sql
-- Xem file migration_update_coach_role.sql
```

### Bước 4: Kiểm tra dữ liệu HLV
```sql
SELECT id, ma_hoi_vien, ho_va_ten, email, role, is_active, password 
FROM huan_luyen_vien 
WHERE is_active = TRUE;
```

Đảm bảo:
- Có ít nhất 1 HLV với `is_active = TRUE`
- Có `email`, `password` không NULL
- `role` là `'owner'` hoặc `'admin'`

### Bước 5: Test đăng nhập
Thử đăng nhập với:
- Email: `thaytien@dongphu.com`
- Password: `123456@LV23`

Hoặc:
- Mã hội viên: `HLV_...` (xem trong database)
- Password: `123456@LV23`

## Kiểm tra Console Logs

### Backend logs
Kiểm tra console của backend server, tìm các log:
- `[Auth Controller] Login request received:`
- `[Auth Debug] Login request received:`
- `[Auth Debug] Coach (HLV) login attempt:`
- `[Auth Debug] Coach login successful:`

### Frontend logs
Kiểm tra browser console, tìm các log:
- `[API Request] POST /auth/login`
- `[API Error]` hoặc `[API Warning]`

## Lưu ý

1. **Database phải được cập nhật**: Entity đã thay đổi, database cần được cập nhật để match
2. **Backend phải restart**: Sau khi thay đổi entity, cần restart backend
3. **Kiểm tra CORS**: Đảm bảo CORS được cấu hình đúng trong `main.ts`
4. **Kiểm tra API base URL**: Frontend phải gọi đúng URL backend (mặc định: http://localhost:4000)

