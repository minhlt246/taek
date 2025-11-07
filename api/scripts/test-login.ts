import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../src/auth/entities/admin.entity';
import { config } from 'dotenv';

config();

async function testLogin() {
  const email = process.argv[2] || 'admin@taekwondomaster.com';
  const password = process.argv[3] || 'admin123';

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taekwondo_club',
    entities: [Admin],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const adminRepository = dataSource.getRepository(Admin);

    // Check admin
    const admin = await adminRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'active_status'],
    });

    if (admin) {
      console.log('📋 Found Admin:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Active: ${admin.active_status ? '✅' : '❌'}`);
      console.log(`   Has Password: ${!!admin.password}`);
      if (admin.password) {
        console.log(`   Password Hash Length: ${admin.password.length}`);
        console.log(`   Password Hash Format: ${admin.password.substring(0, 7)}`);
        
        // Test password
        let passwordHash = admin.password;
        if (passwordHash.startsWith('$2y$')) {
          passwordHash = passwordHash.replace('$2y$', '$2a$');
        }
        
        const isValid = await bcrypt.compare(password, passwordHash);
        console.log(`\n   🔐 Password Test Results:`);
        console.log(`   Test Password: "${password}"`);
        console.log(`   Password Length: ${password.length}`);
        console.log(`   Password Match: ${isValid ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        if (!isValid) {
          console.log(`\n   ⚠️  Password không khớp!`);
          console.log(`   Hãy thử reset password: npm run reset-password ${email} <new-password>`);
        }
      } else {
        console.log(`\n   ⚠️  Admin không có password!`);
      }
      console.log('');
    } else {
      console.log('❌ Admin not found with email:', email);
      console.log('   Hãy kiểm tra lại email hoặc tạo admin mới: npm run create-admin\n');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

testLogin();

