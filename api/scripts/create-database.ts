/**
 * Script đơn giản để tạo database
 * Chạy: npx ts-node scripts/create-database.ts
 */

import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function createDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mysql', // Kết nối vào database mysql để tạo database mới
  };

  const dbName = process.env.DB_DATABASE || 'taekwondo_club';

  console.log('Dang tao database...');
  console.log(`Database: ${dbName}`);
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`User: ${config.user}`);

  try {
    // Kết nối không chỉ định database cụ thể
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password || undefined,
    });

    console.log('Ket noi MySQL thanh cong!');

    // Tạo database
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );

    console.log(`Database "${dbName}" da duoc tao thanh cong!`);

    // Kiểm tra database đã tồn tại
    const [databases] = await connection.execute<mysql.RowDataPacket[]>(
      `SHOW DATABASES LIKE '${dbName}'`,
    );

    if (databases.length > 0) {
      console.log(`\nXac nhan: Database "${dbName}" da ton tai!`);
    }

    await connection.end();
    console.log('\nHoan tat! Bay gio ban co the restart NestJS server.');
  } catch (error: any) {
    console.error('\nLoi:', error.message);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nHuong dan:');
      console.error(
        '1. Kiểm tra lại DB_USERNAME và DB_PASSWORD trong file .env',
      );
      console.error('2. Hoặc chạy SQL trực tiếp trong MySQL client:');
      console.error(
        `\n   CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      );
    }

    process.exit(1);
  }
}

createDatabase();
