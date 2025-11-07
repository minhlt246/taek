import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IUserService } from './interfaces';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if ma_hoi_vien already exists (if provided)
    if (createUserDto.ma_hoi_vien) {
      const existingMemberCode = await this.userRepository.findOne({
        where: { ma_hoi_vien: createUserDto.ma_hoi_vien },
      });

      if (existingMemberCode) {
        throw new ConflictException('Member code already exists');
      }
    }

    // Hash password if provided and not empty
    let hashedPassword: string | undefined;
    if (createUserDto.password && createUserDto.password.trim().length > 0) {
      if (createUserDto.password.trim().length < 6) {
        throw new ConflictException('Password must be at least 6 characters long');
      }
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(createUserDto.password.trim(), saltRounds);
    }

    // Create user - exclude password from spread, add hashed password separately
    const { password, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: [
        'id',
        'ho_va_ten',
        'email',
        'ma_hoi_vien',
        'ma_clb',
        'ma_don_vi',
        'quyen_so',
        'cap_dai_id',
        'phone',
        'ngay_thang_nam_sinh',
        'gioi_tinh',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'active_status',
        'created_at',
        'updated_at',
        // Note: password is not included in select for security
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'ho_va_ten',
        'email',
        'ma_hoi_vien',
        'phone',
        'ngay_thang_nam_sinh',
        'gioi_tinh',
        'address',
        'active_status',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email already exists (if being updated)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if ma_hoi_vien already exists (if being updated)
    if (
      updateUserDto.ma_hoi_vien &&
      updateUserDto.ma_hoi_vien !== user.ma_hoi_vien
    ) {
      const existingMemberCode = await this.userRepository.findOne({
        where: { ma_hoi_vien: updateUserDto.ma_hoi_vien },
      });

      if (existingMemberCode) {
        throw new ConflictException('Member code already exists');
      }
    }

    // Hash password if provided in update and not empty
    let hashedPassword: string | undefined;
    if (updateUserDto.password && updateUserDto.password.trim().length > 0) {
      if (updateUserDto.password.trim().length < 6) {
        throw new ConflictException('Password must be at least 6 characters long');
      }
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(updateUserDto.password.trim(), saltRounds);
    }

    // Update user - exclude password from spread, add hashed password separately
    const { password, ...updateData } = updateUserDto;
    const finalUpdateData: any = { ...updateData };
    if (hashedPassword) {
      finalUpdateData.password = hashedPassword;
    }
    await this.userRepository.update(id, finalUpdateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
