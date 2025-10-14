import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  ping(clientIp: string, userAgent?: string) {
    return { ok: true, clientIp, userAgent };
  }
}
