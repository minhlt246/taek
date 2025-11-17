/**
 * Script để kiểm tra kết nối database và dữ liệu orphan
 * Chạy: npx ts-node scripts/check-database-connection.ts
 */

import { createConnection } from 'typeorm';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function checkDatabaseConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    user: process.env.DB_USERNAME || 'taekwondo_user',
    password: process.env.DB_PASSWORD || 'taekwondo_pass123',
    database: process.env.DB_DATABASE || 'taekwondo_club',
  };

  console.log('🔍 Kiểm tra kết nối database...');
  console.log('Config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
  });

  try {
    // Kiểm tra kết nối cơ bản
    const connection = await mysql.createConnection(config);
    console.log('✅ Kết nối database thành công!');

    // Kiểm tra dữ liệu orphan trong tro_giang_chi_nhanh
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

      console.log('\n💡 Để sửa lỗi, chạy query sau trong MySQL:');
      console.log(
        'DELETE ba FROM tro_giang_chi_nhanh ba\n' +
          'LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id\n' +
          'WHERE hlv.id IS NULL;'
      );
    } else {
      console.log('✅ Không có dữ liệu orphan!');
    }

    // Kiểm tra số lượng records trong các bảng
    console.log('\n📊 Thống kê database:');
    const [coaches] = await connection.execute(
      'SELECT COUNT(*) as count FROM huan_luyen_vien'
    );
    const [assistants] = await connection.execute(
      'SELECT COUNT(*) as count FROM tro_giang_chi_nhanh'
    );

    console.log(`- Số lượng coaches (huan_luyen_vien): ${(coaches as any[])[0].count}`);
    console.log(`- Số lượng branch assistants (tro_giang_chi_nhanh): ${(assistants as any[])[0].count}`);

    await connection.end();
    console.log('\n✅ Kiểm tra hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error);
    process.exit(1);
  }
}

checkDatabaseConnection();

