import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IpSecurityService } from './ip-security.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, IpSecurityService],
  exports: [AuthService],
})
export class AuthModule {}
