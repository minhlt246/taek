import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClubsModule } from './clubs/clubs.module';
import { BeltLevelsModule } from './belt-levels/belt-levels.module';
import { CoachesModule } from './coaches/coaches.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { PaymentsModule } from './payments/payments.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { ParentsModule } from './parents/parents.module';
import { StudentParentsModule } from './student-parents/student-parents.module';
import { databaseConfig } from './config/database.config';

const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions =>
  ({
    ...databaseConfig,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 8889),
    username: configService.get<string>('DB_USERNAME', 'taekwondo_user'),
    password: configService.get<string>('DB_PASSWORD', 'taekwondo_pass123'),
    database: configService.get<string>('DB_DATABASE', 'taekwondo_club'),
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: false, // Disable query logging
  }) as TypeOrmModuleOptions;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', 'env.example'],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ClubsModule,
    BeltLevelsModule,
    CoachesModule,
    CoursesModule,
    EnrollmentsModule,
    PaymentsModule,
    NewsModule,
    EventsModule,
    SchedulesModule,
    ContactMessagesModule,
    ParentsModule,
    StudentParentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
