import { DataSource } from 'typeorm';
import { Admin } from '../src/auth/entities/admin.entity';
import { config } from 'dotenv';

// Load environment variables
config();

async function checkUsers() {
  // Get database config from environment
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

    // Check admins
    const admins = await adminRepository.find({
      select: ['id', 'name', 'email', 'role', 'active_status', 'created_at'],
    });

    console.log('📋 Admin Users:');
    if (admins.length === 0) {
      console.log('   ❌ No admin users found');
      console.log('   💡 Run: npm run create-admin');
    } else {
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email}`);
        console.log(`      Name: ${admin.name}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Active: ${admin.active_status ? '✅' : '❌'}`);
        console.log(`      Created: ${admin.created_at}`);
        console.log('');
      });
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error checking users:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

checkUsers();

