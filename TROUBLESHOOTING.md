# Hướng dẫn xử lý lỗi kết nối API

## Lỗi: "Cannot connect to API server. Please ensure the backend is running on http://localhost:4000"

### Nguyên nhân
Frontend không thể kết nối đến backend server tại `http://localhost:4000`.

### Các bước kiểm tra và khắc phục

#### 1. Kiểm tra Backend có đang chạy không

```bash
# Kiểm tra port 4000 có đang được sử dụng
lsof -ti:4000

# Hoặc kiểm tra backend có phản hồi không
curl http://localhost:4000/swagger
```

**Nếu backend chưa chạy:**
```bash
cd api
npm run dev
# hoặc
npm run start:dev
```

#### 2. Kiểm tra cấu hình Frontend

Đảm bảo file `.env.local` hoặc `.env` trong thư mục `blx/` có cấu hình đúng:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Lưu ý:**
- File `.env.local` có độ ưu tiên cao hơn `.env`
- Sau khi thay đổi `.env`, cần restart Next.js dev server

#### 3. Kiểm tra CORS Configuration

Backend đã được cấu hình CORS để cho phép frontend kết nối. Nếu vẫn gặp lỗi, kiểm tra file `api/src/main.ts`:

```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'])
  : ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:3000'];
```

Đảm bảo frontend đang chạy ở một trong các origin được phép.

#### 4. Restart cả Frontend và Backend

```bash
# Terminal 1: Backend
cd api
npm run dev

# Terminal 2: Frontend  
cd blx
npm run dev
```

#### 5. Kiểm tra Firewall và Network

- Đảm bảo không có firewall chặn port 4000
- Kiểm tra xem có proxy nào đang chặn kết nối không

#### 6. Kiểm tra Browser Console

Mở Developer Tools (F12) và kiểm tra:
- Tab **Console**: Xem có lỗi CORS không
- Tab **Network**: Xem request có được gửi đi không và response là gì

### Các lỗi thường gặp

#### Lỗi CORS
```
Access to XMLHttpRequest at 'http://localhost:4000/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Giải pháp:** Kiểm tra `api/src/main.ts` và đảm bảo origin của frontend được thêm vào `allowedOrigins`.

#### Lỗi Connection Refused
```
ECONNREFUSED
```

**Giải pháp:** Backend chưa được khởi động hoặc đang chạy ở port khác.

#### Lỗi Timeout
```
ETIMEDOUT
```

**Giải pháp:** Tăng timeout trong `blx/src/services/http.ts` hoặc kiểm tra network connection.

### Debug Tips

1. **Test API trực tiếp:**
```bash
curl http://localhost:4000/swagger
```

2. **Kiểm tra biến môi trường trong frontend:**
Thêm vào component:
```typescript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

3. **Kiểm tra logs backend:**
Xem console output của backend để biết có request nào đến không.

### Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, vui lòng cung cấp:
- Output của `lsof -ti:4000`
- Output của `curl http://localhost:4000/swagger`
- Browser console errors
- Backend logs

