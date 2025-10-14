import { Injectable } from '@nestjs/common';

@Injectable()
export class IpSecurityService {
  isAllowed(ip: string): boolean {
    // Placeholder allow-all logic; extend with your policy or CIDR checks
    return Boolean(ip);
  }
}
