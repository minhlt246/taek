/**
 * Script để cập nhật tất cả password cho bảng vo_sinh thành "123456@LV23"
 * Chạy: npx ts-node -r tsconfig-paths/register scripts/update-all-passwords.ts
 */

import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

async function updateAllPasswords() {
  // Load environment variables
  dotenv.config({ path: '.env' });

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'taekwondo_club',
  };

  const newPassword = '123456@LV23';

  console.log('=====================================');
  console.log('Cap nhat password cho tat ca vo sinh');
  console.log('=====================================');
  console.log(`Database: ${config.database}`);
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`New Password: ${newPassword}`);
  console.log('=====================================\n');

  try {
    const connection = await mysql.createConnection(config);
    console.log('Ket noi database thanh cong!\n');

    // Đếm số lượng users trước khi update
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM vo_sinh',
    );
    const totalUsers = (countResult as any[])[0].count;
    console.log(`Tong so vo sinh: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log('Khong co vo sinh nao trong database!');
      await connection.end();
      return;
    }

    // Update password cho tất cả users
    console.log('\nDang cap nhat password...');
    const [updateResult] = await connection.execute(
      'UPDATE vo_sinh SET password = ?',
      [newPassword],
    );

    const affectedRows = (updateResult as any).affectedRows;
    console.log(`\nCap nhat thanh cong: ${affectedRows} vo sinh`);

    // Verify: Kiểm tra một vài users để đảm bảo password đã được update
    console.log('\nKiem tra ket qua...');
    const [verifyResult] = await connection.execute(
      'SELECT id, ho_va_ten, email, password FROM vo_sinh LIMIT 5',
    );

    console.log('\nMau password sau khi cap nhat (5 ban ghi dau tien):');
    (verifyResult as any[]).forEach((user) => {
      console.log(
        `  - ID: ${user.id}, Ten: ${user.ho_va_ten}, Password: ${user.password}`,
      );
    });

    await connection.end();
    console.log('\n=====================================');
    console.log('Cap nhat password hoan tat!');
    console.log('=====================================');
  } catch (error) {
    console.error('Loi khi cap nhat password:', error);
    process.exit(1);
  }
}

updateAllPasswords();

