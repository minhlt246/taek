import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../src/users/entities/user.entity';

async function checkMaDonVi() {
  dotenv.config({ path: '.env' });

  console.log('Starting check ma_don_vi script...');

  try {
    const connection = await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '8889'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'taekwondo_club',
      entities: [User],
      synchronize: false,
      logging: false,
    });

    const userRepository = connection.getRepository(User);

    // Get all users with DEFAULT ma_don_vi
    const usersWithDefault = await userRepository.find({
      where: { ma_don_vi: 'DEFAULT' },
      order: { id: 'ASC' },
      select: ['id', 'ho_va_ten', 'ma_hoi_vien', 'ma_clb', 'ma_don_vi', 'created_at'],
    });

    console.log(`\n=== Tổng số user có ma_don_vi = 'DEFAULT': ${usersWithDefault.length} ===\n`);

    if (usersWithDefault.length > 0) {
      console.log('ID đầu tiên có DEFAULT:', usersWithDefault[0].id);
      console.log('ID cuối cùng có DEFAULT:', usersWithDefault[usersWithDefault.length - 1].id);
      console.log('\n--- 10 user đầu tiên có DEFAULT ---');
      usersWithDefault.slice(0, 10).forEach((user) => {
        console.log(
          `ID: ${user.id}, Tên: ${user.ho_va_ten}, Mã HV: ${user.ma_hoi_vien || 'N/A'}, Mã CLB: ${user.ma_clb}, Mã ĐV: ${user.ma_don_vi}, Created: ${user.created_at}`,
        );
      });

      if (usersWithDefault.length > 10) {
        console.log(`\n... và ${usersWithDefault.length - 10} user khác`);
      }

      // Check if there's a pattern - users from a certain ID onwards
      const firstDefaultId = usersWithDefault[0].id;
      const totalUsers = await userRepository.count();
      const usersAfterFirstDefault = await userRepository
        .createQueryBuilder('user')
        .where('user.id >= :id', { id: firstDefaultId })
        .andWhere('user.ma_don_vi = :maDonVi', { maDonVi: 'DEFAULT' })
        .getCount();

      console.log(`\n--- Phân tích ---`);
      console.log(`Tổng số user trong DB: ${totalUsers}`);
      console.log(`User đầu tiên có DEFAULT: ID ${firstDefaultId}`);
      console.log(`Số user từ ID ${firstDefaultId} trở đi có DEFAULT: ${usersAfterFirstDefault}`);
      console.log(`Số user từ ID ${firstDefaultId} trở đi KHÔNG có DEFAULT: ${totalUsers - firstDefaultId + 1 - usersAfterFirstDefault}`);

      // Check users without DEFAULT to see their ma_don_vi values
      const usersWithoutDefault = await userRepository
        .createQueryBuilder('user')
        .where('user.id >= :id', { id: firstDefaultId })
        .andWhere('user.ma_don_vi != :maDonVi', { maDonVi: 'DEFAULT' })
        .select(['user.id', 'user.ma_don_vi', 'user.ma_clb'])
        .limit(10)
        .getMany();

      if (usersWithoutDefault.length > 0) {
        console.log(`\n--- 10 user từ ID ${firstDefaultId} trở đi KHÔNG có DEFAULT ---`);
        usersWithoutDefault.forEach((user) => {
          console.log(`ID: ${user.id}, Mã ĐV: ${user.ma_don_vi}, Mã CLB: ${user.ma_clb}`);
        });
      }
    } else {
      console.log('Không có user nào có ma_don_vi = "DEFAULT"');
    }

    // Get sample of all users to see ma_don_vi distribution
    const allUsers = await userRepository
      .createQueryBuilder('user')
      .select(['user.ma_don_vi'])
      .getRawMany();

    const maDonViCounts = allUsers.reduce((acc: any, user: any) => {
      const value = user.user_ma_don_vi || 'NULL';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n--- Phân bố ma_don_vi ---`);
    Object.entries(maDonViCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 10)
      .forEach(([value, count]: any) => {
        console.log(`"${value}": ${count} user`);
      });

    await connection.close();
    console.log('\nCheck ma_don_vi script finished.');
  } catch (error) {
    console.error('Error checking ma_don_vi:', error);
    process.exit(1);
  }
}

checkMaDonVi();

