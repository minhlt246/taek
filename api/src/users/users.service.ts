import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { BeltLevelPoomsae } from '../poomsae/belt-level-poomsae.entity';
import { Poomsae } from '../poomsae/poomsae.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IUserService } from './interfaces';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BeltLevelPoomsae)
    private readonly beltLevelPoomsaeRepository: Repository<BeltLevelPoomsae>,
    @InjectRepository(Poomsae)
    private readonly poomsaeRepository: Repository<Poomsae>,
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

    // Validate password is required
    if (!createUserDto.password || createUserDto.password.trim().length === 0) {
      throw new ConflictException('Password is required');
    }

    if (createUserDto.password.trim().length < 6) {
      throw new ConflictException('Password must be at least 6 characters long');
    }

    // Lưu password plain text (không hash)
    const user = this.userRepository.create({
      ...createUserDto,
      password: createUserDto.password.trim(), // Lưu plain text
    });

    return await this.userRepository.save(user);
  }

  /**
   * Map quyen_so (quyền số) to poomsae ID based on standard Taekwondo progression
   * Quyền số = số bài quyền đã học (1-20)
   */
  private async mapQuyenSoToPoomsaeId(quyenSo: number): Promise<number | null> {
    if (quyenSo <= 0 || quyenSo > 20) return null;

    try {
      // Map quyen_so to poomsae name pattern
      // Based on standard Taekwondo: quyen_so represents the poomsae learned
      const poomsaeNameMap: Record<number, string[]> = {
        1: ['Kĩ thuật 1', '기술 1', 'Technique 1'],
        2: ['Kĩ thuật 2', '기술 2', 'Technique 2'],
        3: ['Thái cực 1 Jang', '태극 1장', 'Taegeuk 1 Jang'],
        4: ['Thái cực 2 Jang', '태극 2장', 'Taegeuk 2 Jang'],
        5: ['Thái cực 3 Jang', '태극 3장', 'Taegeuk 3 Jang'],
        6: ['Thái cực 4 Jang', '태극 4장', 'Taegeuk 4 Jang'],
        7: ['Thái cực 5 Jang', '태극 5장', 'Taegeuk 5 Jang'],
        8: ['Thái cực 6 Jang', '태극 6장', 'Taegeuk 6 Jang'],
        9: ['Thái cực 7 Jang', '태극 7장', 'Taegeuk 7 Jang'],
        10: ['Thái cực 8 Jang', '태극 8장', 'Taegeuk 8 Jang'],
        11: ['Koryo', '고려', 'Koryo'],
        12: ['Keumgang', '금강', 'Keumgang'],
        13: ['Taebaek', '태백', 'Taebaek'],
        14: ['Pyongwon', '평원', 'Pyongwon'],
        15: ['Sipjin', '십진', 'Sipjin'],
        16: ['Jitae', '지태', 'Jitae'],
        17: ['Cheonkwon', '천권', 'Cheonkwon'],
        18: ['Hansoo', '한수', 'Hansoo'],
        19: ['Ilyeo', '일여', 'Ilyeo'],
        20: ['Ilyeo', '일여', 'Ilyeo'], // 10 Dan also uses Ilyeo
      };

      const poomsaeNames = poomsaeNameMap[quyenSo];
      if (!poomsaeNames) return null;

      // Find poomsae by name (check Vietnamese, Korean, or English)
      for (const name of poomsaeNames) {
        const poomsae = await this.poomsaeRepository.findOne({
          where: [
            { tenBaiQuyenVietnamese: name },
            { tenBaiQuyenKorean: name },
            { tenBaiQuyenEnglish: name },
          ],
        });

        if (poomsae) {
          return poomsae.id;
        }
      }

      return null;
    } catch (error) {
      console.error(
        `[UsersService] Error mapping quyen_so ${quyenSo} to poomsae:`,
        error,
      );
      return null;
    }
  }

  /**
   * Get belt level ID from poomsae ID using cap_dai_bai_quyen table
   */
  private async getBeltLevelIdFromPoomsaeId(
    poomsaeId: number,
  ): Promise<number | null> {
    try {
      const beltLevelPoomsae = await this.beltLevelPoomsaeRepository.findOne({
        where: {
          baiQuyenId: poomsaeId,
          loaiQuyen: 'bat_buoc', // Required poomsae
        },
        order: { thuTuUuTien: 'ASC' }, // Get first priority
      });

      if (beltLevelPoomsae) {
        return beltLevelPoomsae.capDaiId;
      }

      return null;
    } catch (error) {
      console.error(
        `[UsersService] Error getting belt level from poomsae ${poomsaeId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Get belt level ID from quyen_so by mapping to poomsae first
   */
  private async getBeltLevelIdFromQuyenSo(
    quyenSo: number,
  ): Promise<number | null> {
    // Step 1: Map quyen_so to poomsae ID
    const poomsaeId = await this.mapQuyenSoToPoomsaeId(quyenSo);
    if (!poomsaeId) {
      return null;
    }

    // Step 2: Get belt level ID from poomsae ID
    const beltLevelId = await this.getBeltLevelIdFromPoomsaeId(poomsaeId);
    return beltLevelId;
  }

  async findAll(): Promise<User[]> {
    // Load relations including cap_dai (belt_level)
    // Note: When using relations, we don't use select to avoid issues with relation loading
    const users = await this.userRepository.find({
      relations: ['cap_dai'], // Load belt_level relation
      select: {
        id: true,
        ho_va_ten: true,
        email: true,
        ma_hoi_vien: true,
        ma_clb: true,
        ma_don_vi: true,
        quyen_so: true,
        cap_dai_id: true,
        phone: true,
        ngay_thang_nam_sinh: true,
        gioi_tinh: true,
        address: true,
        emergency_contact_name: true,
        emergency_contact_phone: true,
        active_status: true,
        created_at: true,
        updated_at: true,
        // Exclude password for security
        password: false,
        // Include cap_dai relation with its fields
        cap_dai: {
          id: true,
          name: true,
          color: true,
        },
      },
    });

    // Override cap_dai based on quyen_so (via poomsae) if needed
    // Load all belt levels to map quyen_so to correct belt
    const beltLevelRepository = this.userRepository.manager.getRepository(BeltLevel);
    const allBeltLevels = await beltLevelRepository.find({
      order: { order_sequence: 'ASC' },
    });

    // Create belt level map by ID
    const beltLevelMap = new Map();
    allBeltLevels.forEach((belt) => {
      beltLevelMap.set(belt.id, belt);
    });

    // Update users: use quyen_so -> poomsae -> belt_level mapping
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        // Get correct belt level ID from quyen_so via poomsae
        const correctCapDaiId = await this.getBeltLevelIdFromQuyenSo(user.quyen_so);
        
        if (correctCapDaiId) {
          const correctBeltLevel = beltLevelMap.get(correctCapDaiId);

          if (correctBeltLevel && (!user.cap_dai || user.cap_dai.id !== correctCapDaiId)) {
            // Override with belt level based on quyen_so -> poomsae -> belt_level
            console.log(
              `[UsersService] Mapped user ${user.id} (quyen_so: ${user.quyen_so}) to belt level ${correctCapDaiId} (${correctBeltLevel.name}) via poomsae`,
            );
            return {
              ...user,
              cap_dai_id: correctCapDaiId,
              cap_dai: correctBeltLevel,
            };
          }
        }

        return user;
      }),
    );

    return updatedUsers;
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

    // Validate password if provided in update and not empty
    if (updateUserDto.password && updateUserDto.password.trim().length > 0) {
      if (updateUserDto.password.trim().length < 6) {
        throw new ConflictException('Password must be at least 6 characters long');
      }
      // Lưu password plain text (không hash)
      updateUserDto.password = updateUserDto.password.trim();
    }

    // Update user - lưu password plain text nếu có
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
