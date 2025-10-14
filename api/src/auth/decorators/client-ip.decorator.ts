import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const ClientIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const xff = (req.headers['x-forwarded-for'] as string) || '';
    const ips = xff
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
    return ips[0] || req.ip || req.socket.remoteAddress || '';
  },
);
