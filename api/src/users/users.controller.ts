import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  ImportExcelDto,
} from './dto';
import { CoachesService } from '../coaches/coaches.service';
import type { Request } from 'express';

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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly coachesService: CoachesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 25;

    const result = await this.usersService.findAll(pageNum, limitNum);

    // Format response to include belt_level from cap_dai relation and poomsae name
    return {
      ...result,
      docs: result.docs.map((user) => ({
        ...user,
        belt_level: user.cap_dai
          ? {
              id: user.cap_dai.id,
              name: user.cap_dai.name,
              color: user.cap_dai.color || null,
            }
          : null,
        // Include poomsae name (bai_quyen_name) from service
        bai_quyen_name: (user as any).bai_quyen_name || null,
        quyen: (user as any).bai_quyen_name || null, // Alias for frontend compatibility
      })),
    };
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    try {
      // Lấy user ID và role từ request
      const userId = req.query?.userId || req.body?.userId;
      const userRole = req.query?.role || req.body?.role;

      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const id = parseInt(userId);

      // Nếu role là admin hoặc owner, tìm trong bảng huan_luyen_vien (Coach)
      if (userRole === 'admin' || userRole === 'owner') {
        try {
          const coach = await this.coachesService.findOne(id);

          // Parse images từ JSON string
          let avatarUrl = coach.photo_url || null;
          if (!avatarUrl && coach.images) {
            try {
              const imagesArray =
                typeof coach.images === 'string'
                  ? JSON.parse(coach.images)
                  : coach.images;
              if (Array.isArray(imagesArray) && imagesArray.length > 0) {
                avatarUrl = imagesArray[0];
              }
            } catch (parseError) {
              console.warn(
                '[Users Controller] Error parsing coach images:',
                parseError,
              );
            }
          }

          // Map Coach entity sang format profile
          const profile = {
            id: coach.id,
            ho_va_ten: coach.ho_va_ten,
            name: coach.ho_va_ten, // Alias for frontend
            email: coach.email || '',
            phone: coach.phone || '',
            ma_hoi_vien: coach.ma_hoi_vien || '',
            role: coach.role || 'admin',
            bio: coach.bio || '',
            specialization: coach.specialization || '',
            experience_years: coach.experience_years || 0,
            photo_url: coach.photo_url,
            images: coach.images,
            avatar: avatarUrl,
            profile_image_url: avatarUrl,
            is_active: coach.is_active !== undefined ? coach.is_active : true,
            status: coach.is_active ? 'active' : 'inactive',
            department: coach.specialization || '',
            position: coach.experience_years
              ? `Huấn luyện viên (${coach.experience_years} năm kinh nghiệm)`
              : 'Huấn luyện viên',
            address: '', // Coach entity không có address field
            dateOfBirth: '', // Coach entity không có dateOfBirth field
            joinDate:
              coach.created_at?.toISOString() || new Date().toISOString(),
            lastLogin:
              coach.updated_at?.toISOString() || new Date().toISOString(),
            createdAt: coach.created_at,
            updatedAt: coach.updated_at,
          };

          return profile;
        } catch (error) {
          console.error(
            '[Users Controller] Error fetching coach profile:',
            error,
          );
          // Nếu không tìm thấy coach, fallback về user
        }
      }

      // Fallback: Tìm trong bảng vo_sinh (User)
      const user = await this.usersService.findOne(id);

      // Debug: Log giá trị ma_hoi_vien từ database
      console.log('[Users Controller] User from findOne:', {
        id: user.id,
        ma_hoi_vien: user.ma_hoi_vien,
        ma_hoi_vien_type: typeof user.ma_hoi_vien,
        ma_hoi_vien_isNull: user.ma_hoi_vien === null,
        ma_hoi_vien_isUndefined: user.ma_hoi_vien === undefined,
      });

      // Map User entity sang format profile
      const profile = {
        id: user.id,
        ho_va_ten: user.ho_va_ten,
        name: user.ho_va_ten, // Alias for frontend
        email: user.email,
        phone: user.phone,
        ma_hoi_vien: user.ma_hoi_vien,
        ngay_thang_nam_sinh: user.ngay_thang_nam_sinh,
        gioi_tinh: user.gioi_tinh,
        address: user.address || '',
        dateOfBirth: user.ngay_thang_nam_sinh
          ? new Date(user.ngay_thang_nam_sinh).toISOString()
          : '',
        profile_image_url: user.profile_image_url,
        avatar: user.profile_image_url,
        active_status: user.active_status,
        status: user.active_status ? 'active' : 'inactive',
        role: 'student',
        department: '',
        position: 'Học viên',
        bio: '',
        quyen: (user as any).bai_quyen_name || null, // Poomsae name
        bai_quyen_name: (user as any).bai_quyen_name || null, // Poomsae name
        joinDate: user.created_at?.toISOString() || new Date().toISOString(),
        lastLogin: user.updated_at?.toISOString() || new Date().toISOString(),
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };

      // Debug: Log profile trước khi trả về
      console.log('[Users Controller] Profile to return:', {
        id: profile.id,
        ma_hoi_vien: profile.ma_hoi_vien,
        ma_hoi_vien_type: typeof profile.ma_hoi_vien,
      });

      return profile;
    } catch (error) {
      console.error('[Users Controller] Error in getProfile:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch profile: ${error.message || 'Unknown error'}`,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    // Add poomsae name to response
    return {
      ...user,
      bai_quyen_name: (user as any).bai_quyen_name || null,
      quyen: (user as any).bai_quyen_name || null, // Alias for frontend compatibility
    };
  }

  @Patch('profile')
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    // Lấy user ID từ request (có thể từ token hoặc body)
    // Tạm thời lấy từ query hoặc body, sau này sẽ lấy từ JWT token
    const userId = req.query?.userId || req.body?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const user = await this.usersService.update(
      parseInt(userId),
      updateUserDto,
    );
    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change user password',
    description:
      'Change password for current user. Requires old password and new password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - invalid input or new password same as old password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - old password is incorrect',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    // Lấy user ID từ request (có thể từ token hoặc body)
    const userId = req.query?.userId || req.body?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const id = parseInt(userId);

    await this.usersService.changePassword(
      id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import users from Excel file',
    description:
      'Import multiple users from Excel file. Expected columns: Họ và tên, Email, Ngày sinh, Giới tính, Mã hội viên, Mã CLB, Mã đơn vị, Quyền số, Cấp đai ID, Số điện thoại, Địa chỉ, Tên người liên hệ khẩn cấp, SĐT liên hệ khẩn cấp',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        club_id: {
          type: 'number',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users imported successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or missing required columns',
  })
  async importExcel(
    @UploadedFile() file: MulterFile,
    @Body() body: ImportExcelDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
    ];

    const allowedExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (
      !allowedMimeTypes.includes(file.mimetype) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      throw new BadRequestException(
        'Invalid file type. Please upload an Excel file (.xlsx, .xls, .xlsm)',
      );
    }

    const clubId = body.club_id ? parseInt(String(body.club_id)) : undefined;

    const result = await this.usersService.importFromExcel(file.buffer, clubId);

    return {
      success: result.success,
      message: result.message,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
      },
    };
  }
}
