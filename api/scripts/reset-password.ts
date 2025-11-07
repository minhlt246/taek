import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../src/auth/entities/admin.entity';
import { config } from 'dotenv';

// Load environment variables
config();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3] || 'admin@123';

  if (!email) {
    console.error('❌ Usage: npm run reset-password <email> [new-password]');
    console.error('   Example: npm run reset-password admin@taekwondomaster.com admin123');
    process.exit(1);
  }

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

    // Find admin by email
    const admin = await adminRepository.findOne({
      where: { email },
    });

    if (!admin) {
      console.error(`❌ Admin with email "${email}" not found`);
      await dataSource.destroy();
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    admin.password = hashedPassword;
    await adminRepository.save(admin);

    console.log('✅ Password reset successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.active_status ? '✅' : '❌'}`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

resetPassword();

