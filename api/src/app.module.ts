import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClubsModule } from './clubs/clubs.module';
import { BranchesModule } from './branches/branches.module';
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
import { AttendanceModule } from './attendance/attendance.module';
import { BeltPromotionsModule } from './belt-promotions/belt-promotions.module';
import { CertificatesModule } from './certificates/certificates.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentDetailsModule } from './payment-details/payment-details.module';
import { StudentEvaluationsModule } from './student-evaluations/student-evaluations.module';
import { TuitionPackagesModule } from './tuition-packages/tuition-packages.module';
import { PoomsaeModule } from './poomsae/poomsae.module';
import { MediaModule } from './media/media.module';

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
    BranchesModule,
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
    AttendanceModule,
    BeltPromotionsModule,
    CertificatesModule,
    FeedbacksModule,
    LearningProgressModule,
    NotificationsModule,
    PaymentDetailsModule,
    StudentEvaluationsModule,
    TuitionPackagesModule,
    PoomsaeModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
