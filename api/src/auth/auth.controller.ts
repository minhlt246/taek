import { Controller, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Request } from 'express';
import { ClientIp } from './decorators/client-ip.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  ping(@ClientIp() ip: string, @Req() req: Request) {
    return this.authService.ping(ip, req.headers['user-agent'] as string);
  }
}
