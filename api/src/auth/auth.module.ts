import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IpSecurityService } from './ip-security.service';
import { Admin } from './entities/admin.entity';
import { Coach } from '../coaches/entities/coach.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ParentsModule } from '../parents/parents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Coach, User]),
    UsersModule,
    ParentsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, IpSecurityService],
  exports: [AuthService],
})
export class AuthModule {}
