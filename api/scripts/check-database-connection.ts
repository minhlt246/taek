/**
 * Script để kiểm tra kết nối database và dữ liệu orphan
 * Chạy: npx ts-node scripts/check-database-connection.ts
 */

import { createConnection } from 'typeorm';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

async function checkDatabaseConnection() {
  // Load environment variables
  dotenv.config({ path: '.env' });

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'taekwondo_club',
  };

  console.log('Kiem tra bien ket noi database...');
  console.log('=====================================');
  console.log('Environment Variables:');
  console.log(
    `   DB_HOST: ${process.env.DB_HOST || 'NOT SET (using default: localhost)'}`,
  );
  console.log(
    `   DB_PORT: ${process.env.DB_PORT || 'NOT SET (using default: 8889)'}`,
  );
  console.log(
    `   DB_USERNAME: ${process.env.DB_USERNAME || 'NOT SET (using default: taekwondo_user)'}`,
  );
  console.log(
    `   DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET (***)' : 'NOT SET (using default: taekwondo_pass123)'}`,
  );
  console.log(
    `   DB_DATABASE: ${process.env.DB_DATABASE || 'NOT SET (using default: taekwondo_club)'}`,
  );
  console.log('=====================================');
  console.log('Final Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Username: ${config.user}`);
  console.log(`   Password: ${config.password ? '***' : 'NOT SET'}`);
  console.log('═══════════════════════════════════════\n');

  try {
    // Kiểm tra kết nối cơ bản
    const connection = await mysql.createConnection(config);
    console.log('Ket noi database thanh cong!');

    // Kiểm tra dữ liệu orphan trong tro_giang_chi_nhanh
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

      console.log('\nDe sua loi, chay query sau trong MySQL:');
      console.log(
        'DELETE ba FROM tro_giang_chi_nhanh ba\n' +
          'LEFT JOIN huan_luyen_vien hlv ON ba.assistant_id = hlv.id\n' +
          'WHERE hlv.id IS NULL;',
      );
    } else {
      console.log('Khong co du lieu orphan!');
    }

    // Kiểm tra số lượng records trong các bảng
    console.log('\nThong ke database:');
    const [coaches] = await connection.execute(
      'SELECT COUNT(*) as count FROM huan_luyen_vien',
    );
    const [assistants] = await connection.execute(
      'SELECT COUNT(*) as count FROM tro_giang_chi_nhanh',
    );

    console.log(
      `- Số lượng coaches (huan_luyen_vien): ${(coaches as any[])[0].count}`,
    );
    console.log(
      `- Số lượng branch assistants (tro_giang_chi_nhanh): ${(assistants as any[])[0].count}`,
    );

    await connection.end();
    console.log('\nKiem tra hoan tat!');
  } catch (error) {
    console.error('Loi ket noi database:', error);
    process.exit(1);
  }
}

checkDatabaseConnection();
