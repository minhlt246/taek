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

  console.log('Sua du lieu orphan trong tro_giang_chi_nhanh...');

  try {
    const connection = await mysql.createConnection(config);
    console.log('Ket noi database thanh cong!');

    // Kiểm tra dữ liệu orphan trước
    console.log('\nKiem tra du lieu orphan...');
    const [orphanRows] = await connection.execute(
      `SELECT 
        ba.id,
        ba.branch_id,
        ba.assistant_id,
        ba.is_active,
        ba.assigned_at
      FROM tro_giang_chi_nhanh ba
      LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id
      WHERE hlv.id IS NULL`,
    );

    if (Array.isArray(orphanRows) && orphanRows.length > 0) {
      console.log(`Tim thay ${orphanRows.length} record orphan:`);
      console.table(orphanRows);

      // Xóa dữ liệu orphan
      console.log('\nDang xoa du lieu orphan...');
      const [result] = await connection.execute(
        `DELETE ba FROM tro_giang_chi_nhanh ba
        LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id
        WHERE hlv.id IS NULL`,
      );

      const affectedRows = (result as any).affectedRows;
      console.log(`Da xoa ${affectedRows} record orphan!`);

      // Kiểm tra lại sau khi xóa
      console.log('\nKiem tra lai sau khi xoa...');
      const [remainingOrphans] = await connection.execute(
        `SELECT COUNT(*) as count
        FROM tro_giang_chi_nhanh ba
        LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id
        WHERE hlv.id IS NULL`,
      );

      const remainingCount = (remainingOrphans as any[])[0].count;
      if (remainingCount === 0) {
        console.log('Khong con du lieu orphan!');
        console.log(
          '\nBay gio co the bat lai synchronize trong app.module.ts neu can.',
        );
      } else {
        console.log(`Van con ${remainingCount} record orphan!`);
      }
    } else {
      console.log('Khong co du lieu orphan!');
    }

    await connection.end();
    console.log('\nHoan tat!');
  } catch (error) {
    console.error('Loi:', error);
    process.exit(1);
  }
}

fixOrphanAssistants();
