/**
 * Script để setup database và user MySQL
 * Chạy: npx ts-node scripts/setup-database.ts
 *
 * Lưu ý: Script này cần quyền root để tạo user và database
 */

import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    database: process.env.DB_DATABASE || 'taekwondo_club',
    username: process.env.DB_USERNAME || 'taekwondo_user',
    password: process.env.DB_PASSWORD || 'taekwondo_pass123',
  };

  console.log('Setup Database Configuration');
  console.log('================================');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`Username: ${dbConfig.username}`);
  console.log('');

  // Yêu cầu root password
  const rootPassword = await question(
    'Nhap MySQL root password (de trong neu khong co): ',
  );

  let rootConnection;
  try {
    // Kết nối với root
    rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: 'root',
      password: rootPassword || undefined,
    });

    console.log('Ket noi MySQL thanh cong!');

    // Tạo database
    console.log(`\nDang tao database: ${dbConfig.database}...`);
    await rootConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database "${dbConfig.database}" da duoc tao!`);

    // Kiểm tra user có tồn tại không
    const [users] = await rootConnection.execute<mysql.RowDataPacket[]>(
      `SELECT User, Host FROM mysql.user WHERE User = ? AND Host = ?`,
      [dbConfig.username, 'localhost'],
    );

    if (users.length > 0) {
      console.log(
        `\nUser "${dbConfig.username}" da ton tai. Dang cap nhat password...`,
      );
      await rootConnection.execute(`ALTER USER ?@'localhost' IDENTIFIED BY ?`, [
        dbConfig.username,
        dbConfig.password,
      ]);
      console.log(`Password da duoc cap nhat!`);
    } else {
      console.log(`\nDang tao user: ${dbConfig.username}...`);
      await rootConnection.execute(
        `CREATE USER ?@'localhost' IDENTIFIED BY ?`,
        [dbConfig.username, dbConfig.password],
      );
      console.log(`User "${dbConfig.username}" da duoc tao!`);
    }

    // Cấp quyền
    console.log(`\nDang cap quyen cho user...`);
    await rootConnection.execute(
      `GRANT ALL PRIVILEGES ON \`${dbConfig.database}\`.* TO ?@'localhost'`,
      [dbConfig.username],
    );
    await rootConnection.execute(`FLUSH PRIVILEGES`);
    console.log(`Quyen da duoc cap!`);

    // Kiểm tra kết nối với user mới
    console.log(`\nDang kiem tra ket noi voi user moi...`);
    const testConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    const [result] = await testConnection.execute('SELECT 1 as test');
    console.log('Ket noi voi user moi thanh cong!');

    await testConnection.end();
    await rootConnection.end();

    console.log('\nSetup database hoan tat!');
    console.log('\nBay gio ban co the chay ung dung NestJS.');
  } catch (error: any) {
    console.error('\nLoi khi setup database:');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Loi: Khong the ket noi voi MySQL root.');
      console.error('Hay dam bao:');
      console.error('   1. MySQL đang chạy');
      console.error('   2. Root password đúng');
      console.error('   3. Hoặc chạy lệnh MySQL thủ công:');
      console.error(
        `\n   CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      );
      console.error(
        `   CREATE USER IF NOT EXISTS '${dbConfig.username}'@'localhost' IDENTIFIED BY '${dbConfig.password}';`,
      );
      console.error(
        `   GRANT ALL PRIVILEGES ON \`${dbConfig.database}\`.* TO '${dbConfig.username}'@'localhost';`,
      );
      console.error(`   FLUSH PRIVILEGES;`);
    } else {
      console.error(error.message);
    }
    if (rootConnection) {
      await rootConnection.end();
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupDatabase();
