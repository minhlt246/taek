import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  timezone: '+07:00',
  // Disable query logging to reduce console noise
  logging: false,
  // Optimize for smaller bundle
  extra: {
    // Reduce connection pool size for smaller apps
    connectionLimit: 10,
  },
};
