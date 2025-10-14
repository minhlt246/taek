import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.controller';

@Injectable()
export class AuthService {
  ping(clientIp: string, userAgent?: string) {
    return {
      success: true,
      message: 'API is working',
      data: {
        ip: clientIp,
        userAgent: userAgent || 'Unknown',
        timestamp: new Date().toISOString(),
      },
    };
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Validate input data
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // TODO: Implement actual login logic with database
      // For now, return optimized response structure
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: email,
            role: 'student',
          },
          token: 'mock-jwt-token',
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const { name, email, password, phone, role } = registerDto;

      if (!name || !email || !password) {
        throw new BadRequestException('Name, email and password are required');
      }

      // TODO: Implement actual registration logic with database
      // Check if email already exists
      // Hash password
      // Create user

      return {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: 2,
            name: name,
            email: email,
            phone: phone,
            role: role || 'student',
          },
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new ConflictException('Email already exists');
    }
  }

  async getProfile(req: any) {
    try {
      // TODO: Implement JWT token validation
      // Extract user from JWT token

      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
          },
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
