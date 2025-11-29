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

  console.log('🔧 Setup Database Configuration');
  console.log('================================');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`Username: ${dbConfig.username}`);
  console.log('');

  // Yêu cầu root password
  const rootPassword = await question('Nhập MySQL root password (để trống nếu không có): ');
  
  let rootConnection;
  try {
    // Kết nối với root
    rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: 'root',
      password: rootPassword || undefined,
    });

    console.log('✅ Kết nối MySQL thành công!');

    // Tạo database
    console.log(`\n📦 Đang tạo database: ${dbConfig.database}...`);
    await rootConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database "${dbConfig.database}" đã được tạo!`);

    // Kiểm tra user có tồn tại không
    const [users] = await rootConnection.execute<mysql.RowDataPacket[]>(
      `SELECT User, Host FROM mysql.user WHERE User = ? AND Host = ?`,
      [dbConfig.username, 'localhost']
    );

    if (users.length > 0) {
      console.log(`\n👤 User "${dbConfig.username}" đã tồn tại. Đang cập nhật password...`);
      await rootConnection.execute(
        `ALTER USER ?@'localhost' IDENTIFIED BY ?`,
        [dbConfig.username, dbConfig.password]
      );
      console.log(`✅ Password đã được cập nhật!`);
    } else {
      console.log(`\n👤 Đang tạo user: ${dbConfig.username}...`);
      await rootConnection.execute(
        `CREATE USER ?@'localhost' IDENTIFIED BY ?`,
        [dbConfig.username, dbConfig.password]
      );
      console.log(`✅ User "${dbConfig.username}" đã được tạo!`);
    }

    // Cấp quyền
    console.log(`\n🔐 Đang cấp quyền cho user...`);
    await rootConnection.execute(
      `GRANT ALL PRIVILEGES ON \`${dbConfig.database}\`.* TO ?@'localhost'`,
      [dbConfig.username]
    );
    await rootConnection.execute(`FLUSH PRIVILEGES`);
    console.log(`✅ Quyền đã được cấp!`);

    // Kiểm tra kết nối với user mới
    console.log(`\n🔍 Đang kiểm tra kết nối với user mới...`);
    const testConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    const [result] = await testConnection.execute('SELECT 1 as test');
    console.log('✅ Kết nối với user mới thành công!');

    await testConnection.end();
    await rootConnection.end();

    console.log('\n🎉 Setup database hoàn tất!');
    console.log('\nBây giờ bạn có thể chạy ứng dụng NestJS.');
  } catch (error: any) {
    console.error('\n❌ Lỗi khi setup database:');
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('⚠️  Lỗi: Không thể kết nối với MySQL root.');
      console.error('💡 Hãy đảm bảo:');
      console.error('   1. MySQL đang chạy');
      console.error('   2. Root password đúng');
      console.error('   3. Hoặc chạy lệnh MySQL thủ công:');
      console.error(`\n   CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.error(`   CREATE USER IF NOT EXISTS '${dbConfig.username}'@'localhost' IDENTIFIED BY '${dbConfig.password}';`);
      console.error(`   GRANT ALL PRIVILEGES ON \`${dbConfig.database}\`.* TO '${dbConfig.username}'@'localhost';`);
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

