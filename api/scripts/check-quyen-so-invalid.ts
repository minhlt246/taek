import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '8889', 10),
  user: process.env.DB_USERNAME || 'taekwondo_user',
  password: process.env.DB_PASSWORD || 'taekwondo_pass123',
  database: process.env.DB_DATABASE || 'taekwondo_club',
};

async function checkInvalidQuyenSo() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra các quyen_so không tồn tại trong bảng bai_quyen
    const [invalidRows] = await connection.execute(
      `SELECT 
        vs.id,
        vs.ho_va_ten,
        vs.ma_hoi_vien,
        vs.quyen_so,
        CASE 
          WHEN bq.id IS NULL THEN 'Không tồn tại'
          ELSE 'Tồn tại'
        END as trang_thai
      FROM vo_sinh vs
      LEFT JOIN bai_quyen bq ON vs.quyen_so = bq.id
      WHERE bq.id IS NULL
      ORDER BY vs.quyen_so`,
    );

    if (Array.isArray(invalidRows) && invalidRows.length > 0) {
      console.log(
        `❌ Tìm thấy ${invalidRows.length} võ sinh có quyen_so không hợp lệ:\n`,
      );
      console.table(invalidRows);

      // Thống kê theo quyen_so
      const [stats] = await connection.execute(
        `SELECT 
          vs.quyen_so,
          COUNT(*) as so_luong
        FROM vo_sinh vs
        LEFT JOIN bai_quyen bq ON vs.quyen_so = bq.id
        WHERE bq.id IS NULL
        GROUP BY vs.quyen_so
        ORDER BY vs.quyen_so`,
      );

      console.log('\n📊 Thống kê quyen_so không hợp lệ:');
      console.table(stats);

      // Lấy danh sách ID hợp lệ trong bai_quyen
      const [validIds] = await connection.execute(
        `SELECT id, ten_bai_quyen_vietnamese, ten_bai_quyen_english 
         FROM bai_quyen 
         ORDER BY id 
         LIMIT 20`,
      );

      console.log(
        '\n✅ Danh sách ID hợp lệ trong bảng bai_quyen (20 đầu tiên):',
      );
      console.table(validIds);

      console.log('\n💡 Để sửa lỗi, bạn có thể:');
      console.log('1. Cập nhật quyen_so thành ID hợp lệ trong bảng bai_quyen');
      console.log('2. Hoặc set quyen_so = NULL nếu chưa có bài quyền');
      console.log('\nVí dụ SQL để sửa:');
      console.log('UPDATE vo_sinh SET quyen_so = 1 WHERE quyen_so = 72;');
    } else {
      console.log('✅ Không có quyen_so nào không hợp lệ!');
    }

    // Kiểm tra tổng số bản ghi
    const [totalUsers] = await connection.execute(
      'SELECT COUNT(*) as count FROM vo_sinh',
    );
    const [totalPoomsae] = await connection.execute(
      'SELECT COUNT(*) as count FROM bai_quyen',
    );

    console.log('\n📈 Thống kê tổng quan:');
    console.log(`- Tổng số võ sinh: ${(totalUsers as any[])[0].count}`);
    console.log(`- Tổng số bài quyền: ${(totalPoomsae as any[])[0].count}`);

    await connection.end();
    console.log('\n✅ Kiểm tra hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

checkInvalidQuyenSo();
