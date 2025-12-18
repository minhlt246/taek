# Giải thích về Quyền Số (quyen_so)

## Vấn đề hiện tại

Hiện tại trong bảng `vo_sinh`, cột `quyen_so` đang lưu các giá trị như **72, 73, 74** - đây là các số tự do, không có ràng buộc với bảng `bai_quyen`.

## Nguyên nhân

1. **Thiếu validation**: Khi tạo/cập nhật võ sinh, hệ thống không kiểm tra xem `quyen_so` có tồn tại trong bảng `bai_quyen` hay không
2. **Cho phép nhập tự do**: Frontend/Backend cho phép nhập bất kỳ số nào vào `quyen_so`
3. **Không có foreign key**: Cột `quyen_so` không có ràng buộc foreign key đến bảng `bai_quyen`

## Giải pháp đã áp dụng

### 1. **Validation trong Backend**

Đã thêm validation trong:
- `UsersService.create()`: Kiểm tra `quyen_so` phải là ID hợp lệ trong bảng `bai_quyen` trước khi tạo user
- `UsersService.update()`: Kiểm tra `quyen_so` phải là ID hợp lệ trong bảng `bai_quyen` trước khi cập nhật
- `UsersService.importFromExcel()`: Validate từng dòng trong Excel, bỏ qua các dòng có `quyen_so` không hợp lệ

### 2. **Thông báo lỗi rõ ràng**

Khi `quyen_so` không hợp lệ, hệ thống sẽ trả về lỗi:
```
Quyền số {số} không tồn tại trong bảng bài quyền. Vui lòng chọn bài quyền hợp lệ.
```

### 3. **Logic validation**

```typescript
// Kiểm tra quyen_so có tồn tại trong bảng bai_quyen không
const poomsae = await this.poomsaeRepository.findOne({
  where: { id: quyen_so },
});

if (!poomsae) {
  throw new BadRequestException(
    `Quyền số ${quyen_so} không tồn tại trong bảng bài quyền.`
  );
}
```

## Cách sử dụng đúng

### Quyền số phải là ID của bài quyền

`quyen_so` phải là **ID** (primary key) của một bài quyền trong bảng `bai_quyen`, không phải số thứ tự hay mã bài quyền.

**Ví dụ:**
- ✅ Đúng: `quyen_so = 1` (nếu bài quyền có ID = 1 trong bảng `bai_quyen`)
- ✅ Đúng: `quyen_so = 72` (nếu bài quyền có ID = 72 trong bảng `bai_quyen`)
- ❌ Sai: `quyen_so = 72` (nếu không có bài quyền nào có ID = 72)

### Kiểm tra ID bài quyền hợp lệ

Để biết ID bài quyền nào hợp lệ, có thể:
1. Xem trong bảng `bai_quyen` trong database
2. Gọi API `GET /poomsae` để lấy danh sách bài quyền và xem ID của từng bài

## Cải thiện đề xuất (tương lai)

### Option 1: Thêm Foreign Key (Khuyến nghị)

Thay đổi cột `quyen_so` thành foreign key đến `bai_quyen.id`:

```sql
ALTER TABLE vo_sinh 
ADD CONSTRAINT fk_vo_sinh_bai_quyen 
FOREIGN KEY (quyen_so) REFERENCES bai_quyen(id);
```

**Ưu điểm:**
- Database tự động đảm bảo tính toàn vẹn dữ liệu
- Không thể xóa bài quyền nếu còn võ sinh đang sử dụng
- Không cần validation trong code

**Nhược điểm:**
- Cần migration database
- Cần xử lý dữ liệu cũ không hợp lệ trước

### Option 2: Đổi tên cột thành `bai_quyen_id`

Thay đổi tên cột từ `quyen_so` thành `bai_quyen_id` để rõ ràng hơn:

```sql
ALTER TABLE vo_sinh 
CHANGE COLUMN quyen_so bai_quyen_id INT,
ADD CONSTRAINT fk_vo_sinh_bai_quyen 
FOREIGN KEY (bai_quyen_id) REFERENCES bai_quyen(id);
```

## Tóm tắt

- **Vấn đề**: `quyen_so` hiện tại cho phép nhập bất kỳ số nào (72, 73, 74...)
- **Giải pháp**: Đã thêm validation để đảm bảo `quyen_so` phải là ID hợp lệ trong bảng `bai_quyen`
- **Cách dùng**: `quyen_so` phải là ID (primary key) của bài quyền trong bảng `bai_quyen`
- **Tương lai**: Nên thêm foreign key để database tự động đảm bảo tính toàn vẹn


