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
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { CoachesService } from '../coaches/coaches.service';
import type { Request } from 'express';

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
  async findAll() {
    const users = await this.usersService.findAll();
    // Format response to include belt_level from cap_dai relation
    return users.map((user) => ({
      ...user,
      belt_level: user.cap_dai
        ? {
            id: user.cap_dai.id,
            name: user.cap_dai.name,
            color: user.cap_dai.color || null,
          }
        : null,
    }));
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
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
            const imagesArray = typeof coach.images === 'string' 
              ? JSON.parse(coach.images) 
              : coach.images;
            if (Array.isArray(imagesArray) && imagesArray.length > 0) {
              avatarUrl = imagesArray[0];
            }
          } catch (parseError) {
            console.warn('[Users Controller] Error parsing coach images:', parseError);
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
          joinDate: coach.created_at?.toISOString() || new Date().toISOString(),
          lastLogin: coach.updated_at?.toISOString() || new Date().toISOString(),
          createdAt: coach.created_at,
          updatedAt: coach.updated_at,
        };

        return profile;
      } catch (error) {
        console.error('[Users Controller] Error fetching coach profile:', error);
        // Nếu không tìm thấy coach, fallback về user
      }
    }

    // Fallback: Tìm trong bảng vo_sinh (User)
    const user = await this.usersService.findOne(id);
    
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
      joinDate: user.created_at?.toISOString() || new Date().toISOString(),
      lastLogin: user.updated_at?.toISOString() || new Date().toISOString(),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return profile;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return user; // Return object directly for frontend compatibility
  }

  @Patch('profile')
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    // Lấy user ID từ request (có thể từ token hoặc body)
    // Tạm thời lấy từ query hoặc body, sau này sẽ lấy từ JWT token
    const userId = req.query?.userId || req.body?.userId;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const user = await this.usersService.update(parseInt(userId), updateUserDto);
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
}
