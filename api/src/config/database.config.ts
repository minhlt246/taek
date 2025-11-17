import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  timezone: '+07:00',
  // Disable query logging to reduce console noise
  logging: false,
  // Connection retry configuration
  retryAttempts: 10,
  retryDelay: 3000, // 3 seconds
  // Connection timeout
  connectTimeout: 60000, // 60 seconds
  // Optimize connection pool
  extra: {
    // Connection pool configuration
    connectionLimit: 10,
    // Connection timeout settings
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // Keep connection alive
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Reconnect on connection lost
    reconnect: true,
  },
};
