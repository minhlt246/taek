import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { IpSecurityService } from './ip-security.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, IpSecurityService],
  exports: [AuthService],
})
export class AuthModule {}
