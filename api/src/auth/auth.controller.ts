import { Controller, Get, Req, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { ClientIp } from './decorators/client-ip.decorator';

// Type definition for multer file
type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
};

// DTOs
export class LoginDto {
  @IsOptional()
  @IsString()
  email?: string; // Optional - can be email, username, phone, or ma_hoi_vien

  @IsOptional()
  @IsString()
  username?: string; // Optional - for username/ho_va_ten login

  @IsOptional()
  @IsString()
  ma_hoi_vien?: string; // Optional - for member code login

  @IsOptional()
  @IsString()
  phone?: string; // Optional - for phone login

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['admin', 'student', 'HLV', 'parent'], {
    message: 'Role must be one of: admin, student, HLV, parent',
  })
  role?: 'admin' | 'student' | 'HLV' | 'parent';
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
    description: 'Authenticate user with email, username, phone, or ma_hoi_vien and password'
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
    status: 400, 
    description: 'Bad request - missing required fields'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials'
  })
  async login(@Body() loginDto: LoginDto) {
    // Log request để debug
    console.log('[Auth Controller] Login request received:', {
      email: loginDto.email,
      username: loginDto.username,
      ma_hoi_vien: loginDto.ma_hoi_vien,
      phone: loginDto.phone,
      hasPassword: !!loginDto.password,
      passwordLength: loginDto.password?.length || 0,
    });
    
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

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload profile avatar',
    description: 'Upload avatar image for current user (admin/coach)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Avatar uploaded successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid file or missing file'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized'
  })
  async uploadAvatar(@UploadedFile() file: MulterFile, @Body() body: any, @Req() req: Request) {
    console.log('[Auth Controller] Upload avatar - Raw request:', {
      hasFile: !!file,
      fileKeys: file ? Object.keys(file) : [],
      bodyKeys: Object.keys(body || {}),
      queryKeys: Object.keys(req.query || {}),
      headers: req.headers['content-type'],
      contentType: req.headers['content-type'],
    });

    // Log chi tiết về request
    console.log('[Auth Controller] Request details:', {
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
      },
      bodyType: typeof body,
      bodyKeys: body ? Object.keys(body) : [],
    });

    if (!file) {
      console.error('[Auth Controller] No file uploaded');
      console.error('[Auth Controller] Request body:', body);
      console.error('[Auth Controller] Request headers:', req.headers);
      throw new BadRequestException('No file uploaded. Please make sure the file field is named "image" and the request uses multipart/form-data.');
    }

    // Validate file type - hỗ trợ nhiều định dạng ảnh (jpg, png, gif, webp, svg, bmp, ico, tiff, v.v.)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/tiff',
      'image/x-tiff',
    ];
    
    // Mapping các extension ảnh phổ biến (hỗ trợ nhiều định dạng)
    const extToMime: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'ico': 'image/x-icon',
      'tiff': 'image/tiff',
      'tif': 'image/tiff',
    };
    
    console.log('[Auth Controller] File validation:', {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
      extension: file.originalname ? file.originalname.toLowerCase().split('.').pop() : null,
      isAllowed: allowedMimeTypes.includes(file.mimetype),
    });
    
    // Kiểm tra mimetype - nếu không có hoặc không đúng, thử detect từ extension
    let isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    if (!isValidMimeType && file.originalname) {
      const ext = file.originalname.toLowerCase().split('.').pop();
      // Kiểm tra xem extension có trong danh sách ảnh được hỗ trợ không
      // Nếu có extension nhưng không có trong extToMime, vẫn chấp nhận nếu là file ảnh (bắt đầu bằng image/)
      if (ext) {
        if (extToMime[ext]) {
          console.log('[Auth Controller] Detected mime type from extension:', {
            extension: ext,
            detectedMimeType: extToMime[ext],
          });
          // Cập nhật mimetype nếu detect được từ extension
          (file as any).mimetype = extToMime[ext];
          isValidMimeType = true;
        } else if (file.mimetype && file.mimetype.startsWith('image/')) {
          // Nếu mimetype bắt đầu bằng 'image/' nhưng không có trong allowedMimeTypes
          // Vẫn chấp nhận vì đây là file ảnh (hỗ trợ mọi định dạng ảnh)
          console.log('[Auth Controller] Accepting image file with unknown extension:', {
            extension: ext,
            mimetype: file.mimetype,
          });
          isValidMimeType = true;
        }
      }
    }
    
    if (!isValidMimeType) {
      console.error('[Auth Controller] Invalid file type:', {
        mimetype: file.mimetype,
        originalname: file.originalname,
        extension: file.originalname ? file.originalname.toLowerCase().split('.').pop() : null,
        allowedTypes: allowedMimeTypes,
      });
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype || 'unknown'}. Only image files are allowed (jpg, png, gif, webp, svg, bmp, ico, tiff, etc.)`,
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Multer với FileInterceptor sẽ parse các field text vào req.body
    // Lấy userId và role từ body (được gửi từ frontend trong FormData)
    const userId = body?.userId || req.query?.userId;
    const userRole = body?.role || req.query?.role;
    
    console.log('[Auth Controller] Upload avatar request:', {
      hasFile: !!file,
      fileName: file?.originalname,
      fileSize: file?.size,
      fileMimeType: file?.mimetype,
      userId,
      userRole,
      bodyKeys: Object.keys(body || {}),
    });
    
    return this.authService.uploadAvatar(file, userId, userRole);
  }
}
