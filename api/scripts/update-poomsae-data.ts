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

// Dữ liệu bài quyền theo yêu cầu
const poomsaeData = [
  // Bài quyền theo Cấp đai (1-8)
  {
    id: 1,
    tenBaiQuyenVietnamese: 'Quyền số 1',
    tenBaiQuyenKorean: '태극 1장 (Taegeuk Il-jang)',
    capDo: 'Cơ bản',
  },
  {
    id: 2,
    tenBaiQuyenVietnamese: 'Quyền số 2',
    tenBaiQuyenKorean: '태극 2장 (Taegeuk E-jang)',
    capDo: 'Cơ bản',
  },
  {
    id: 3,
    tenBaiQuyenVietnamese: 'Quyền số 3',
    tenBaiQuyenKorean: '태극 3장 (Taegeuk Sam-jang)',
    capDo: 'Cơ bản',
  },
  {
    id: 4,
    tenBaiQuyenVietnamese: 'Quyền số 4',
    tenBaiQuyenKorean: '태극 4장 (Taegeuk Sa-jang)',
    capDo: 'Cơ bản',
  },
  {
    id: 5,
    tenBaiQuyenVietnamese: 'Quyền số 5',
    tenBaiQuyenKorean: '태극 5장 (Taegeuk Oh-jang)',
    capDo: 'Trung cấp',
  },
  {
    id: 6,
    tenBaiQuyenVietnamese: 'Quyền số 6',
    tenBaiQuyenKorean: '태극 6장 (Taegeuk Yook-jang)',
    capDo: 'Trung cấp',
  },
  {
    id: 7,
    tenBaiQuyenVietnamese: 'Quyền số 7',
    tenBaiQuyenKorean: '태극 7장 (Taegeuk Chil-jang)',
    capDo: 'Trung cấp',
  },
  {
    id: 8,
    tenBaiQuyenVietnamese: 'Quyền số 8',
    tenBaiQuyenKorean: '태극 8장 (Taegeuk Pal-jang)',
    capDo: 'Trung cấp',
  },
  // Bài quyền theo Đẳng (9-17)
  {
    id: 9,
    tenBaiQuyenVietnamese: 'Quyền số 9',
    tenBaiQuyenKorean: '고려 (Koryo)',
    capDo: 'Nâng cao',
  },
  {
    id: 10,
    tenBaiQuyenVietnamese: 'Quyền số 10',
    tenBaiQuyenKorean: '금강 (Keumgang)',
    capDo: 'Nâng cao',
  },
  {
    id: 11,
    tenBaiQuyenVietnamese: 'Quyền số 11',
    tenBaiQuyenKorean: '태백 (Taebaek)',
    capDo: 'Nâng cao',
  },
  {
    id: 12,
    tenBaiQuyenVietnamese: 'Quyền số 12',
    tenBaiQuyenKorean: '평원 (Pyongwon)',
    capDo: 'Nâng cao',
  },
  {
    id: 13,
    tenBaiQuyenVietnamese: 'Quyền số 13',
    tenBaiQuyenKorean: '십진 (Sipjin)',
    capDo: 'Nâng cao',
  },
  {
    id: 14,
    tenBaiQuyenVietnamese: 'Quyền số 14',
    tenBaiQuyenKorean: '지태 (Jitae)',
    capDo: 'Nâng cao',
  },
  {
    id: 15,
    tenBaiQuyenVietnamese: 'Quyền số 15',
    tenBaiQuyenKorean: '천권 (Chonkwon)',
    capDo: 'Nâng cao',
  },
  {
    id: 16,
    tenBaiQuyenVietnamese: 'Quyền số 16',
    tenBaiQuyenKorean: '한수 (Hanso)',
    capDo: 'Nâng cao',
  },
  {
    id: 17,
    tenBaiQuyenVietnamese: 'Quyền số 17',
    tenBaiQuyenKorean: '일여 (Ilyeo)',
    capDo: 'Nâng cao',
  },
];

async function updatePoomsaeData() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Kết nối database thành công!\n');

    // Xóa cột ten_bai_quyen_english nếu tồn tại
    console.log('🗑️  Đang xóa cột ten_bai_quyen_english...');
    try {
      await connection.execute(
        'ALTER TABLE bai_quyen DROP COLUMN ten_bai_quyen_english',
      );
      console.log('✅ Đã xóa cột ten_bai_quyen_english\n');
    } catch (error: any) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Cột ten_bai_quyen_english không tồn tại, bỏ qua\n');
      } else {
        throw error;
      }
    }

    // Cập nhật dữ liệu bài quyền
    console.log('📝 Đang cập nhật dữ liệu bài quyền...\n');
    let updatedCount = 0;
    let createdCount = 0;

    for (const poomsae of poomsaeData) {
      // Kiểm tra xem bài quyền có tồn tại không
      const [existing] = await connection.execute(
        'SELECT id FROM bai_quyen WHERE id = ?',
        [poomsae.id],
      );

      if (Array.isArray(existing) && existing.length > 0) {
        // Cập nhật bài quyền hiện có
        await connection.execute(
          `UPDATE bai_quyen 
           SET ten_bai_quyen_vietnamese = ?, 
               ten_bai_quyen_korean = ?, 
               cap_do = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            poomsae.tenBaiQuyenVietnamese,
            poomsae.tenBaiQuyenKorean,
            poomsae.capDo,
            poomsae.id,
          ],
        );
        console.log(
          `✅ Đã cập nhật bài quyền ${poomsae.id}: ${poomsae.tenBaiQuyenVietnamese}`,
        );
        updatedCount++;
      } else {
        // Tạo bài quyền mới
        await connection.execute(
          `INSERT INTO bai_quyen 
           (id, ten_bai_quyen_vietnamese, ten_bai_quyen_korean, cap_do, created_at, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            poomsae.id,
            poomsae.tenBaiQuyenVietnamese,
            poomsae.tenBaiQuyenKorean,
            poomsae.capDo,
          ],
        );
        console.log(
          `✅ Đã tạo bài quyền ${poomsae.id}: ${poomsae.tenBaiQuyenVietnamese}`,
        );
        createdCount++;
      }
    }

    console.log('\n📊 Tóm tắt:');
    console.log(`- Đã cập nhật: ${updatedCount} bài quyền`);
    console.log(`- Đã tạo mới: ${createdCount} bài quyền`);
    console.log(`- Tổng cộng: ${poomsaeData.length} bài quyền\n`);

    // Hiển thị danh sách bài quyền sau khi cập nhật
    const [allPoomsae] = await connection.execute(
      'SELECT id, ten_bai_quyen_vietnamese, ten_bai_quyen_korean, cap_do FROM bai_quyen ORDER BY id',
    );

    console.log('📋 Danh sách bài quyền sau khi cập nhật:');
    console.table(allPoomsae);

    await connection.end();
    console.log('\n✅ Hoàn tất cập nhật dữ liệu bài quyền!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updatePoomsaeData();
