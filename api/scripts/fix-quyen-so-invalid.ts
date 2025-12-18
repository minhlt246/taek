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

async function fixInvalidQuyenSo() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Kết nối database thành công!\n');

    // Kiểm tra các quyen_so không hợp lệ
    const [invalidRows] = await connection.execute(
      `SELECT 
        vs.id,
        vs.ho_va_ten,
        vs.ma_hoi_vien,
        vs.quyen_so,
        vs.cap_dai_id
      FROM vo_sinh vs
      LEFT JOIN bai_quyen bq ON vs.quyen_so = bq.id
      WHERE bq.id IS NULL
      ORDER BY vs.quyen_so, vs.id`,
    );

    if (!Array.isArray(invalidRows) || invalidRows.length === 0) {
      console.log('✅ Không có quyen_so nào không hợp lệ!');
      await connection.end();
      return;
    }

    console.log(
      `❌ Tìm thấy ${invalidRows.length} võ sinh có quyen_so không hợp lệ:\n`,
    );

    // Lấy danh sách bài quyền hợp lệ
    const [validPoomsaes] = await connection.execute(
      `SELECT id, ten_bai_quyen_vietnamese, cap_do 
       FROM bai_quyen 
       ORDER BY id`,
    );

    console.log('✅ Danh sách bài quyền hợp lệ:');
    console.table(validPoomsaes);

    // Map quyen_so không hợp lệ về giá trị hợp lệ
    // Logic: Map dựa trên cap_dai_id hoặc set về 1 (bài quyền đầu tiên)
    let updatedCount = 0;
    let skippedCount = 0;

    console.log('\n📝 Đang cập nhật quyen_so...\n');

    for (const row of invalidRows as any[]) {
      const userId = row.id;
      const currentQuyenSo = row.quyen_so;
      const capDaiId = row.cap_dai_id;

      // Tìm bài quyền phù hợp dựa trên cap_dai_id
      // Nếu không tìm thấy, set về 1 (bài quyền đầu tiên)
      let newQuyenSo = 1; // Default to first poomsae

      // Logic: Dựa trên cap_dai_id để chọn bài quyền phù hợp
      // Cấp đai thấp (ID cao) -> bài quyền thấp (ID thấp)
      // Cấp đai cao (ID thấp) -> bài quyền cao (ID cao)
      if (capDaiId) {
        // Lấy danh sách bài quyền theo cấp độ
        const basicPoomsaes = (validPoomsaes as any[]).filter(
          (p) => p.cap_do === 'Cơ bản',
        );
        const intermediatePoomsaes = (validPoomsaes as any[]).filter(
          (p) => p.cap_do === 'Trung cấp',
        );
        const advancedPoomsaes = (validPoomsaes as any[]).filter(
          (p) => p.cap_do === 'Nâng cao',
        );

        // Map cap_dai_id sang bài quyền (logic đơn giản)
        // Có thể điều chỉnh logic này dựa trên yêu cầu thực tế
        if (capDaiId >= 10) {
          // Cấp đai thấp -> bài quyền cơ bản
          newQuyenSo = basicPoomsaes[0]?.id || 1;
        } else if (capDaiId >= 5) {
          // Cấp đai trung -> bài quyền trung cấp
          newQuyenSo = intermediatePoomsaes[0]?.id || 5;
        } else {
          // Cấp đai cao -> bài quyền nâng cao
          newQuyenSo = advancedPoomsaes[0]?.id || 9;
        }
      }

      // Cập nhật quyen_so
      try {
        await connection.execute(
          `UPDATE vo_sinh 
           SET quyen_so = ? 
           WHERE id = ?`,
          [newQuyenSo, userId],
        );

        const poomsaeName =
          (validPoomsaes as any[]).find((p) => p.id === newQuyenSo)
            ?.ten_bai_quyen_vietnamese || `Quyền số ${newQuyenSo}`;

        console.log(
          `✅ User ${userId} (${row.ho_va_ten}): quyen_so ${currentQuyenSo} -> ${newQuyenSo} (${poomsaeName})`,
        );
        updatedCount++;
      } catch (error: any) {
        console.error(`❌ Lỗi khi cập nhật user ${userId}: ${error.message}`);
        skippedCount++;
      }
    }

    console.log('\n📊 Tóm tắt:');
    console.log(`- Đã cập nhật: ${updatedCount} võ sinh`);
    console.log(`- Bỏ qua: ${skippedCount} võ sinh`);

    // Kiểm tra lại sau khi cập nhật
    const [remainingInvalid] = await connection.execute(
      `SELECT COUNT(*) as count
       FROM vo_sinh vs
       LEFT JOIN bai_quyen bq ON vs.quyen_so = bq.id
       WHERE bq.id IS NULL`,
    );

    const remainingCount = (remainingInvalid as any[])[0]?.count || 0;
    if (remainingCount === 0) {
      console.log('\n✅ Tất cả quyen_so đã được cập nhật hợp lệ!');
      console.log(
        '\n💡 Bây giờ bạn có thể bật lại foreign key constraint trong entity.',
      );
    } else {
      console.log(
        `\n⚠️  Vẫn còn ${remainingCount} võ sinh có quyen_so không hợp lệ.`,
      );
    }

    await connection.end();
    console.log('\n✅ Hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

fixInvalidQuyenSo();
