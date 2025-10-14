import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { ClientIp } from './decorators/client-ip.decorator';

// DTOs
export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'admin' | 'student' | 'HLV';
}

export class AuthResponseDto {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token?: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  @ApiOperation({ 
    summary: 'Ping endpoint',
    description: 'Test endpoint to check if the API is working and get client information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ping successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            ip: { type: 'string' },
            userAgent: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  })
  ping(@ClientIp() ip: string, @Req() req: Request) {
    return this.authService.ping(ip, req.headers['user-agent'] as string);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'User login credentials'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials'
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'User registration',
    description: 'Register a new user account'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'User registration information'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already exists'
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current user profile information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized'
  })
  async getProfile(@Req() req: Request) {
    return this.authService.getProfile(req);
  }
}
