import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../src/auth/entities/admin.entity';
import { config } from 'dotenv';

// Load environment variables
config();

async function createAdmin() {
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
    console.log('✅ Database connected');

    const adminRepository = dataSource.getRepository(Admin);

    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({
      where: { email: 'admin@taekwondo.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
      console.log('   To update password, use: npm run hash-password <new-password>');
      await dataSource.destroy();
      return;
    }

    // Get password from command line or use default
    const password = process.argv[2] || 'admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = adminRepository.create({
      name: 'System Administrator',
      email: 'admin@taekwondo.com',
      password: hashedPassword,
      role: 'super_admin',
      phone: '0123456789',
      active_status: true,
    });

    await adminRepository.save(admin);
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@taekwondo.com');
    console.log('   Password: ' + password);
    console.log('   Role: super_admin');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

createAdmin();

