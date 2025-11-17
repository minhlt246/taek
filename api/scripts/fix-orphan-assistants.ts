/**
 * Script để xóa dữ liệu orphan trong bảng tro_giang_chi_nhanh
 * Chạy: npx ts-node -r tsconfig-paths/register scripts/fix-orphan-assistants.ts
 */

import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function fixOrphanAssistants() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    user: process.env.DB_USERNAME || 'taekwondo_user',
    password: process.env.DB_PASSWORD || 'taekwondo_pass123',
    database: process.env.DB_DATABASE || 'taekwondo_club',
  };

  console.log('🔧 Sửa dữ liệu orphan trong tro_giang_chi_nhanh...');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Kết nối database thành công!');

    // Kiểm tra dữ liệu orphan trước
    console.log('\n🔍 Kiểm tra dữ liệu orphan...');
    const [orphanRows] = await connection.execute(
      `SELECT 
        ba.id,
        ba.branch_id,
        ba.assistant_id,
        ba.is_active,
        ba.assigned_at
      FROM tro_giang_chi_nhanh ba
      LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id
      WHERE hlv.id IS NULL`
    );

    if (Array.isArray(orphanRows) && orphanRows.length > 0) {
      console.log(`⚠️  Tìm thấy ${orphanRows.length} record orphan:`);
      console.table(orphanRows);

      // Xóa dữ liệu orphan
      console.log('\n🗑️  Đang xóa dữ liệu orphan...');
      const [result] = await connection.execute(
        `DELETE ba FROM tro_giang_chi_nhanh ba
        LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id
        WHERE hlv.id IS NULL`
      );

      const affectedRows = (result as any).affectedRows;
      console.log(`✅ Đã xóa ${affectedRows} record orphan!`);

      // Kiểm tra lại sau khi xóa
      console.log('\n🔍 Kiểm tra lại sau khi xóa...');
      const [remainingOrphans] = await connection.execute(
        `SELECT COUNT(*) as count
        FROM tro_giang_chi_nhanh ba
        LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id
        WHERE hlv.id IS NULL`
      );

      const remainingCount = (remainingOrphans as any[])[0].count;
      if (remainingCount === 0) {
        console.log('✅ Không còn dữ liệu orphan!');
        console.log('\n💡 Bây giờ có thể bật lại synchronize trong app.module.ts nếu cần.');
      } else {
        console.log(`⚠️  Vẫn còn ${remainingCount} record orphan!`);
      }
    } else {
      console.log('✅ Không có dữ liệu orphan!');
    }

    await connection.end();
    console.log('\n✅ Hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

fixOrphanAssistants();

