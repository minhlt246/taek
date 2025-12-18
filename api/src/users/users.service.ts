import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { BeltLevelPoomsae } from '../poomsae/belt-level-poomsae.entity';
import { Poomsae } from '../poomsae/poomsae.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IUserService } from './interfaces';
import * as XLSX from 'xlsx';

@Injectable()
export class UsersService implements IUserService, OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BeltLevelPoomsae)
    private readonly beltLevelPoomsaeRepository: Repository<BeltLevelPoomsae>,
    @InjectRepository(Poomsae)
    private readonly poomsaeRepository: Repository<Poomsae>,
  ) {}

  async onModuleInit() {
    // Fix duplicate empty ma_hoi_vien on startup
    try {
      await this.fixDuplicateMaHoiVien();
    } catch (error) {
      this.logger.warn(
        'Failed to fix duplicate ma_hoi_vien on startup:',
        error.message,
      );
    }
  }

  /**
   * Fix duplicate empty ma_hoi_vien by converting empty strings to NULL
   * and recreate unique index if needed
   */
  private async fixDuplicateMaHoiVien(): Promise<void> {
    try {
      // Step 1: Update all empty strings to NULL
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ ma_hoi_vien: null })
        .where("ma_hoi_vien = '' OR TRIM(ma_hoi_vien) = ''")
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(
          `Fixed ${result.affected} records with empty ma_hoi_vien`,
        );
      }

      // Step 2: Check if unique index exists, if not create it
      const queryRunner =
        this.userRepository.manager.connection.createQueryRunner();
      try {
        const table = await queryRunner.getTable('vo_sinh');
        const indexExists = table?.indices.some(
          (idx) =>
            idx.name === 'IDX_624be563ef47696d519ff536f9' ||
            (idx.isUnique && idx.columnNames.includes('ma_hoi_vien')),
        );

        if (!indexExists) {
          // Create unique index on ma_hoi_vien
          await queryRunner.query(`
            CREATE UNIQUE INDEX IDX_624be563ef47696d519ff536f9 
            ON vo_sinh (ma_hoi_vien)
          `);
          this.logger.log('Recreated unique index on ma_hoi_vien');
        }
      } catch (indexError) {
        // Index might already exist or other error, ignore
        this.logger.debug(
          'Index creation check error (may be expected):',
          indexError.message,
        );
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      // Ignore if index doesn't exist or other errors
      this.logger.debug(
        'fixDuplicateMaHoiVien error (may be expected):',
        error.message,
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists (only if email is provided)
    if (createUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
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
      throw new ConflictException(
        'Password must be at least 6 characters long',
      );
    }

    // Validate quyen_so: phải là ID hợp lệ trong bảng bai_quyen
    if (
      createUserDto.quyen_so !== undefined &&
      createUserDto.quyen_so !== null
    ) {
      const poomsae = await this.poomsaeRepository.findOne({
        where: { id: createUserDto.quyen_so },
      });

      if (!poomsae) {
        throw new BadRequestException(
          `Quyền số ${createUserDto.quyen_so} không tồn tại trong bảng bài quyền. Vui lòng chọn bài quyền hợp lệ.`,
        );
      }
    }

    // Lưu password plain text (không hash)
    // Convert ma_hoi_vien rỗng thành null để tránh duplicate entry
    let maHoiVien = createUserDto.ma_hoi_vien?.trim() || null;

    // Nếu không có ma_hoi_vien, sẽ tự động tạo sau khi save (dựa vào ID)
    // Xử lý ma_don_vi: nếu không có thì set DEFAULT (vì entity yêu cầu NOT NULL)
    const maDonVi = createUserDto.ma_don_vi?.trim() || 'DEFAULT';

    const user = this.userRepository.create({
      ...createUserDto,
      ma_hoi_vien: maHoiVien,
      ma_don_vi: maDonVi, // Đảm bảo luôn có giá trị
      password: createUserDto.password.trim(), // Lưu plain text
    });

    const savedUser = await this.userRepository.save(user);

    // Tự động tạo mã hội viên nếu chưa có (sau khi đã có ID)
    if (!savedUser.ma_hoi_vien || savedUser.ma_hoi_vien.trim() === '') {
      const generatedMaHoiVien = `VS-${String(savedUser.id).padStart(6, '0')}`;
      savedUser.ma_hoi_vien = generatedMaHoiVien;
      await this.userRepository.update(savedUser.id, {
        ma_hoi_vien: generatedMaHoiVien,
      });
    }

    return savedUser;
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
          where: [{ tenBaiQuyenVietnamese: name }, { tenBaiQuyenKorean: name }],
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

  async findAll(
    page: number = 1,
    limit: number = 25,
  ): Promise<{
    docs: User[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }> {
    // Load relations including cap_dai (belt_level)
    // Note: bai_quyen relation is temporarily disabled due to invalid quyen_so data
    // Note: When using relations, we don't use select to avoid issues with relation loading

    // Get total count
    const totalDocs = await this.userRepository.count();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalDocs / limit);

    const users = await this.userRepository.find({
      skip,
      take: limit,
      relations: ['cap_dai', 'bai_quyen'], // Load belt_level and poomsae relations
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
        // Include bai_quyen relation with its fields
        bai_quyen: {
          id: true,
          tenBaiQuyenVietnamese: true,
          tenBaiQuyenKorean: true,
        },
      },
    });

    // Override cap_dai based on quyen_so (via poomsae) if needed
    // Load all belt levels to map quyen_so to correct belt
    const beltLevelRepository =
      this.userRepository.manager.getRepository(BeltLevel);
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
        // Use existing mapping logic: quyen_so -> poomsae ID -> poomsae name
        // This ensures poomsae name matches the correct belt level
        const poomsaeId = await this.mapQuyenSoToPoomsaeId(user.quyen_so);
        let baiQuyenName: string | null = null;

        if (poomsaeId) {
          const poomsae = await this.poomsaeRepository.findOne({
            where: { id: poomsaeId },
          });
          if (poomsae) {
            baiQuyenName = poomsae.tenBaiQuyenVietnamese;
          }
        }

        // Fallback to relation if mapping fails
        if (!baiQuyenName) {
          const poomsae = (user as any).bai_quyen;
          baiQuyenName = poomsae
            ? poomsae.tenBaiQuyenVietnamese
            : user.quyen_so
              ? `Quyền ${user.quyen_so}`
              : null;
        }

        // Get correct belt level ID from quyen_so via poomsae (using existing logic)
        const correctCapDaiId = await this.getBeltLevelIdFromQuyenSo(
          user.quyen_so,
        );

        if (correctCapDaiId) {
          const correctBeltLevel = beltLevelMap.get(correctCapDaiId);

          if (
            correctBeltLevel &&
            (!user.cap_dai || user.cap_dai.id !== correctCapDaiId)
          ) {
            // Override with belt level based on quyen_so -> poomsae -> belt_level
            console.log(
              `[UsersService] Mapped user ${user.id} (quyen_so: ${user.quyen_so}) to belt level ${correctCapDaiId} (${correctBeltLevel.name}) via poomsae`,
            );
            return {
              ...user,
              cap_dai_id: correctCapDaiId,
              cap_dai: correctBeltLevel,
              bai_quyen_name: baiQuyenName,
            } as any;
          }
        }

        return {
          ...user,
          bai_quyen_name: baiQuyenName,
        } as any;
      }),
    );

    return {
      docs: updatedUsers,
      totalDocs,
      limit,
      page,
      totalPages,
    };
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
        'quyen_so',
        'cap_dai_id',
        'profile_image_url',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Use existing mapping logic to get poomsae name based on quyen_so
    // This ensures poomsae name matches the correct belt level
    if (user.quyen_so) {
      try {
        const poomsaeId = await this.mapQuyenSoToPoomsaeId(user.quyen_so);
        if (poomsaeId) {
          const poomsae = await this.poomsaeRepository.findOne({
            where: { id: poomsaeId },
          });
          if (poomsae) {
            (user as any).bai_quyen_name = poomsae.tenBaiQuyenVietnamese;
          } else {
            (user as any).bai_quyen_name = `Quyền ${user.quyen_so}`;
          }
        } else {
          // Fallback: try to get from relation (with error handling)
          try {
            const userWithPoomsae = await this.userRepository.findOne({
              where: { id },
              relations: ['bai_quyen'],
            });
            if (userWithPoomsae) {
              const poomsae = (userWithPoomsae as any).bai_quyen;
              (user as any).bai_quyen_name = poomsae
                ? poomsae.tenBaiQuyenVietnamese
                : `Quyền ${user.quyen_so}`;
            } else {
              (user as any).bai_quyen_name = `Quyền ${user.quyen_so}`;
            }
          } catch (relationError) {
            this.logger.warn(
              `[UsersService] Error loading bai_quyen relation for user ${id}:`,
              relationError.message,
            );
            (user as any).bai_quyen_name = `Quyền ${user.quyen_so}`;
          }
        }
      } catch (error) {
        this.logger.warn(
          `[UsersService] Error mapping quyen_so to poomsae for user ${id}:`,
          error.message,
        );
        (user as any).bai_quyen_name = user.quyen_so
          ? `Quyền ${user.quyen_so}`
          : null;
      }
    }

    // Debug: Log giá trị ma_hoi_vien từ database
    this.logger.debug(`[UsersService] findOne - User ${id} ma_hoi_vien:`, {
      ma_hoi_vien: user.ma_hoi_vien,
      type: typeof user.ma_hoi_vien,
      isNull: user.ma_hoi_vien === null,
      isUndefined: user.ma_hoi_vien === undefined,
    });

    // Tự động tạo mã hội viên nếu chưa có
    if (
      !user.ma_hoi_vien ||
      (typeof user.ma_hoi_vien === 'string' && user.ma_hoi_vien.trim() === '')
    ) {
      const generatedMaHoiVien = `VS-${String(user.id).padStart(6, '0')}`;

      this.logger.log(
        `[UsersService] Auto-generating ma_hoi_vien for user ${id}: ${generatedMaHoiVien}`,
      );

      // Lưu vào database trước khi trả về
      try {
        await this.userRepository.update(id, {
          ma_hoi_vien: generatedMaHoiVien,
        });
        user.ma_hoi_vien = generatedMaHoiVien;
        this.logger.log(
          `[UsersService] Successfully auto-generated ma_hoi_vien for user ${id}: ${generatedMaHoiVien}`,
        );
      } catch (error) {
        this.logger.warn(
          `[UsersService] Failed to auto-generate ma_hoi_vien for user ${id}:`,
          error.message,
        );
        // Vẫn trả về user với mã đã generate (trong memory) dù update fail
        user.ma_hoi_vien = generatedMaHoiVien;
      }
    } else {
      this.logger.debug(
        `[UsersService] User ${id} already has ma_hoi_vien: ${user.ma_hoi_vien}`,
      );
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

    // Validate quyen_so: phải là ID hợp lệ trong bảng bai_quyen
    if (
      updateUserDto.quyen_so !== undefined &&
      updateUserDto.quyen_so !== null
    ) {
      const poomsae = await this.poomsaeRepository.findOne({
        where: { id: updateUserDto.quyen_so },
      });

      if (!poomsae) {
        throw new BadRequestException(
          `Quyền số ${updateUserDto.quyen_so} không tồn tại trong bảng bài quyền. Vui lòng chọn bài quyền hợp lệ.`,
        );
      }
    }

    // Convert ma_hoi_vien rỗng thành null để tránh duplicate entry
    // Tạo object riêng để update với ma_hoi_vien có thể là null
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.ma_hoi_vien !== undefined) {
      updateData.ma_hoi_vien = updateUserDto.ma_hoi_vien?.trim() || null;
    }

    // Check if ma_hoi_vien already exists (if being updated)
    if (updateData.ma_hoi_vien && updateData.ma_hoi_vien !== user.ma_hoi_vien) {
      const existingMemberCode = await this.userRepository.findOne({
        where: { ma_hoi_vien: updateData.ma_hoi_vien },
      });

      if (existingMemberCode) {
        throw new ConflictException('Member code already exists');
      }
    }

    // Validate password if provided in update and not empty
    if (updateUserDto.password && updateUserDto.password.trim().length > 0) {
      if (updateUserDto.password.trim().length < 6) {
        throw new ConflictException(
          'Password must be at least 6 characters long',
        );
      }
      // Lưu password plain text (không hash)
      updateUserDto.password = updateUserDto.password.trim();
    }

    // Update user - lưu password plain text nếu có
    await this.userRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /**
   * Change user password
   * @param id - User ID
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @returns Promise<void>
   */
  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Find user with password field included
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password', 'email', 'ho_va_ten'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate old password
    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    // Compare passwords (plain text comparison - hệ thống đang dùng plain text)
    const normalizedOldPassword = oldPassword.trim();
    const normalizedDbPassword = user.password.trim();

    const isPasswordValid =
      normalizedDbPassword === normalizedOldPassword ||
      normalizedDbPassword.toLowerCase() ===
        normalizedOldPassword.toLowerCase();

    if (!isPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Validate new password
    if (!newPassword || newPassword.trim().length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters long',
      );
    }

    // Check if new password is same as old password
    if (normalizedDbPassword === newPassword.trim()) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }

    // Update password (plain text - theo cách hệ thống đang dùng)
    await this.userRepository.update(id, {
      password: newPassword.trim(),
    });
  }

  /**
   * Import users from Excel file
   * Expected Excel format:
   * - Row 1: Headers (Họ và tên, Email, Ngày sinh, Giới tính, Mã hội viên, Mã CLB, Mã đơn vị, Quyền số, Cấp đai ID, Số điện thoại, Địa chỉ, Tên người liên hệ khẩn cấp, SĐT liên hệ khẩn cấp)
   * - Row 2+: Data rows
   */
  async importFromExcel(
    fileBuffer: Buffer,
    clubId?: number,
  ): Promise<{
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, {
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false,
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Read as array of arrays with raw values
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false, // Convert all values to strings
        blankrows: false, // Skip blank rows
      }) as any[];

      if (data.length < 2) {
        throw new BadRequestException(
          'Excel file must have at least header row and one data row',
        );
      }

      const headers = data[0] as string[];
      const rows = data.slice(1);

      // Normalize headers: trim, remove extra spaces, convert to lowercase
      const normalizedHeaders = headers.map((h) =>
        h ? h.toString().trim().replace(/\s+/g, ' ').toLowerCase() : '',
      );

      // Log headers for debugging
      this.logger.log('Excel headers found: ' + JSON.stringify(headers));
      this.logger.log(
        'Normalized headers: ' + JSON.stringify(normalizedHeaders),
      );

      // Find column indices with improved matching
      const findColumnIndex = (keywords: string[]): number => {
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase().trim();
          // Try exact match first
          const exactIndex = normalizedHeaders.findIndex(
            (h) => h === normalizedKeyword,
          );
          if (exactIndex !== -1) return exactIndex;

          // Try contains match
          const containsIndex = normalizedHeaders.findIndex((h) =>
            h.includes(normalizedKeyword),
          );
          if (containsIndex !== -1) return containsIndex;
        }
        return -1;
      };

      const hoTenIndex = findColumnIndex([
        'họ và tên',
        'ho va ten',
        'họ tên',
        'ho ten',
        'tên',
        'ten',
        'name',
        'họ tên đầy đủ',
        'ho ten day du',
      ]);
      const emailIndex = findColumnIndex([
        'email',
        'e-mail',
        'e mail',
        'mail',
        'địa chỉ email',
        'dia chi email',
      ]);
      const ngaySinhIndex = findColumnIndex([
        'ngày sinh',
        'ngay sinh',
        'ngày tháng năm sinh',
        'ngay thang nam sinh',
        'date of birth',
        'dob',
      ]);
      const gioiTinhIndex = findColumnIndex([
        'giới tính',
        'gioi tinh',
        'gender',
        'sex',
      ]);
      const maHoiVienIndex = findColumnIndex([
        'mã hội viên',
        'ma hoi vien',
        'mã',
        'ma',
        'code',
        'member code',
      ]);
      const maHvIndex = findColumnIndex([
        'mã hv',
        'ma hv',
        'mã hội viên',
        'ma hoi vien',
        'mhv',
      ]);
      const maClbIndex = findColumnIndex([
        'mã clb',
        'ma clb',
        'mã câu lạc bộ',
        'ma cau lac bo',
        'club',
        'club code',
      ]);
      const maDonViIndex = findColumnIndex([
        'mã đơn vị',
        'ma don vi',
        'mã đv',
        'ma dv',
        'branch',
        'branch code',
      ]);
      const quyenSoIndex = findColumnIndex([
        'quyền số',
        'quyen so',
        'quyền',
        'quyen',
        'poomsae',
      ]);
      const capDaiIdIndex = findColumnIndex([
        'cấp đai id',
        'cap dai id',
        'cấp đai',
        'cap dai',
        'cấp đai dự thi',
        'cap dai du thi',
        'belt level',
        'belt level id',
      ]);
      const phoneIndex = findColumnIndex([
        'số điện thoại',
        'so dien thoai',
        'sđt',
        'sdt',
        'phone',
        'phone number',
      ]);
      const addressIndex = findColumnIndex(['địa chỉ', 'dia chi', 'address']);
      const emergencyContactNameIndex = findColumnIndex([
        'tên người liên hệ khẩn cấp',
        'ten nguoi lien he khan cap',
        'người liên hệ',
        'nguoi lien he',
        'emergency contact',
        'emergency contact name',
      ]);
      const emergencyContactPhoneIndex = findColumnIndex([
        'sđt liên hệ khẩn cấp',
        'sdt lien he khan cap',
        'số điện thoại liên hệ khẩn cấp',
        'so dien thoai lien he khan cap',
        'emergency contact phone',
        'emergency phone',
      ]);

      // Log column indices found
      this.logger.log('Column indices found:');
      this.logger.log(`- hoTenIndex: ${hoTenIndex}`);
      this.logger.log(`- emailIndex: ${emailIndex}`);
      this.logger.log(`- maHoiVienIndex: ${maHoiVienIndex}`);
      this.logger.log(`- maHvIndex: ${maHvIndex}`);
      this.logger.log(`- maClbIndex: ${maClbIndex}`);
      this.logger.log(`- maDonViIndex: ${maDonViIndex}`);
      this.logger.log(`- capDaiIdIndex: ${capDaiIdIndex}`);
      this.logger.log(`- phoneIndex: ${phoneIndex}`);
      this.logger.log(`- Available headers: ${headers.join(', ')}`);

      // Validate required columns: Mã hội viên là bắt buộc
      if (maHoiVienIndex === -1) {
        throw new BadRequestException(
          `Excel file must have "Mã hội viên" column. Available columns: ${headers.join(', ')}`,
        );
      }

      const imported: number[] = [];
      const errors: string[] = [];

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because row 1 is header, and array is 0-indexed

        try {
          // Skip empty rows
          const hasData = row.some(
            (cell: any) => cell !== null && cell !== undefined && cell !== '',
          );
          if (!hasData) {
            continue;
          }

          // Helper function to safely extract cell value
          const getCellValue = (index: number): string => {
            if (index === -1 || index >= row.length) return '';
            const cell = row[index];
            if (cell === null || cell === undefined) return '';
            // Handle different cell types
            if (typeof cell === 'number') {
              return cell.toString();
            }
            if (typeof cell === 'boolean') {
              return cell ? '1' : '0';
            }
            if (cell instanceof Date) {
              return cell.toISOString().split('T')[0];
            }
            return String(cell).trim();
          };

          // Extract data from row
          const hoTen = getCellValue(hoTenIndex);
          const email = getCellValue(emailIndex);

          // Debug log for first few rows
          if (i < 3) {
            this.logger.log(
              `Row ${rowNumber} - hoTenIndex: ${hoTenIndex}, emailIndex: ${emailIndex}`,
            );
            this.logger.log(
              `Row ${rowNumber} - hoTen: "${hoTen}", email: "${email}"`,
            );
            this.logger.log(
              `Row ${rowNumber} - raw row data: ${JSON.stringify(row)}`,
            );
          }
          const ngaySinh = getCellValue(ngaySinhIndex);
          const gioiTinh = getCellValue(gioiTinhIndex);
          const maHoiVien = getCellValue(maHoiVienIndex);
          const maHv = getCellValue(maHvIndex);
          const maClb = getCellValue(maClbIndex);
          const maDonVi = getCellValue(maDonViIndex);

          // Debug log for ma_don_vi - log first 5 rows to help debug
          if (i < 5) {
            this.logger.warn(`[Import Excel] Row ${rowNumber}:`);
            this.logger.warn(
              `  - maDonViIndex: ${maDonViIndex} (${maDonViIndex === -1 ? 'NOT FOUND' : 'FOUND'})`,
            );
            this.logger.warn(`  - maDonVi raw value: "${maDonVi}"`);
            this.logger.warn(`  - maDonVi trimmed: "${maDonVi?.trim() || ''}"`);
            this.logger.warn(`  - maHoiVien: "${maHoiVien}"`);
          }

          // Validate quyen_so: phải là ID hợp lệ trong bảng bai_quyen
          const quyenSoRaw =
            quyenSoIndex !== -1 ? getCellValue(quyenSoIndex) : '';
          let quyenSo: number | undefined = undefined;

          if (quyenSoRaw && quyenSoRaw.trim() !== '') {
            const quyenSoNum = Number(quyenSoRaw);
            if (!isNaN(quyenSoNum)) {
              // Kiểm tra xem quyen_so có tồn tại trong bảng bai_quyen không
              const poomsae = await this.poomsaeRepository.findOne({
                where: { id: quyenSoNum },
              });

              if (poomsae) {
                quyenSo = quyenSoNum;
              } else {
                errors.push(
                  `Dòng ${rowNumber}: Quyền số ${quyenSoNum} không tồn tại trong bảng bài quyền. Vui lòng sử dụng ID bài quyền hợp lệ từ bảng bai_quyen.`,
                );
                continue; // Skip row này
              }
            } else {
              errors.push(
                `Dòng ${rowNumber}: Quyền số "${quyenSoRaw}" không hợp lệ. Phải là số (ID bài quyền từ bảng bai_quyen).`,
              );
              continue; // Skip row này
            }
          } else {
            // Nếu không có quyen_so, có thể để undefined hoặc set default
            // Tạm thời để undefined để validation trong create() xử lý
            quyenSo = undefined;
          }

          const capDaiId =
            capDaiIdIndex !== -1 ? Number(getCellValue(capDaiIdIndex)) || 1 : 1;
          const phone = getCellValue(phoneIndex);
          const address = getCellValue(addressIndex);
          const emergencyContactName = getCellValue(emergencyContactNameIndex);
          const emergencyContactPhone = getCellValue(
            emergencyContactPhoneIndex,
          );

          // Validate required fields: Mã hội viên là bắt buộc
          if (!maHoiVien) {
            errors.push(`Dòng ${rowNumber}: Mã hội viên là bắt buộc`);
            continue;
          }

          // Check if ma_hoi_vien already exists
          const existingMemberCode = await this.userRepository.findOne({
            where: { ma_hoi_vien: maHoiVien },
          });
          if (existingMemberCode) {
            errors.push(
              `Dòng ${rowNumber}: Mã hội viên "${maHoiVien}" đã tồn tại`,
            );
            continue;
          }

          // Auto-generate email from ma_hoi_vien if not provided
          let finalEmail = email && email.trim() !== '' ? email.trim() : '';
          if (!finalEmail) {
            // Generate email from ma_hoi_vien
            const cleanMaHoiVien = maHoiVien
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '');
            finalEmail = `${cleanMaHoiVien}@vosinh.local`;

            // Check if generated email already exists, if yes, add suffix
            let emailSuffix = 1;
            let uniqueEmail = finalEmail;
            while (true) {
              const existingUser = await this.userRepository.findOne({
                where: { email: uniqueEmail },
              });
              if (!existingUser) {
                finalEmail = uniqueEmail;
                break;
              }
              uniqueEmail = `${cleanMaHoiVien}${emailSuffix}@vosinh.local`;
              emailSuffix++;
              // Safety check to avoid infinite loop
              if (emailSuffix > 1000) {
                finalEmail = `${cleanMaHoiVien}_${Date.now()}@vosinh.local`;
                break;
              }
            }
          } else {
            // Check if provided email already exists
            const existingUser = await this.userRepository.findOne({
              where: { email: finalEmail },
            });
            if (existingUser) {
              errors.push(
                `Dòng ${rowNumber}: Email "${finalEmail}" đã tồn tại`,
              );
              continue;
            }
          }

          // Parse date - set default if not provided
          let parsedDate: Date;
          if (ngaySinh && ngaySinh.trim() !== '') {
            // Try to parse date in various formats
            const dateStr = ngaySinh.toString();
            let tempDate: Date | undefined;

            // Handle Excel date serial number
            if (!isNaN(Number(dateStr))) {
              // Excel date serial number
              const excelEpoch = new Date(1899, 11, 30);
              const days = Number(dateStr);
              tempDate = new Date(
                excelEpoch.getTime() + days * 24 * 60 * 60 * 1000,
              );
            } else {
              // Try parsing as ISO date string
              tempDate = new Date(dateStr);
              if (isNaN(tempDate.getTime())) {
                // Try DD/MM/YYYY or DD-MM-YYYY
                const parts = dateStr.split(/[\/\-]/);
                if (parts.length === 3) {
                  tempDate = new Date(
                    parseInt(parts[2]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[0]),
                  );
                }
              }
            }

            // Use parsed date if valid, otherwise use default
            if (tempDate && !isNaN(tempDate.getTime())) {
              parsedDate = tempDate;
            } else {
              // Default date: 1/1/2000 (reasonable default for students)
              parsedDate = new Date('2000-01-01');
            }
          } else {
            // Default date: 1/1/2000 (reasonable default for students)
            parsedDate = new Date('2000-01-01');
          }

          // Normalize gender
          let normalizedGender: 'Nam' | 'Nữ' = 'Nam';
          if (gioiTinh) {
            const genderLower = gioiTinh.toLowerCase();
            if (
              genderLower.includes('nữ') ||
              genderLower.includes('nu') ||
              genderLower === 'f' ||
              genderLower === 'female'
            ) {
              normalizedGender = 'Nữ';
            } else {
              normalizedGender = 'Nam';
            }
          }

          // Generate default password (use email or ma_hoi_vien)
          const defaultPassword = maHoiVien || email.split('@')[0] || '123456';

          // Create user
          const userData: CreateUserDto = {
            ho_va_ten: hoTen || maHoiVien || 'Võ sinh',
            email: finalEmail,
            password: defaultPassword,
            ngay_thang_nam_sinh: parsedDate.toISOString().split('T')[0], // Always provide a date
            gioi_tinh: normalizedGender,
            ma_hoi_vien: maHoiVien || undefined,
            ma_hv: maHv || undefined,
            ma_clb: maClb || 'DEFAULT', // Required field, use default if not provided
            // Only use DEFAULT if maDonViIndex was not found (-1) or value is truly empty
            // If column exists but is empty, still use empty string to preserve user intent
            ma_don_vi:
              maDonViIndex === -1 || !maDonVi || maDonVi.trim() === ''
                ? 'DEFAULT'
                : maDonVi.trim(),
            quyen_so: quyenSo,
            cap_dai_id: capDaiId,
            phone: phone || undefined,
            address: address || undefined,
            emergency_contact_name: emergencyContactName || undefined,
            emergency_contact_phone: emergencyContactPhone || undefined,
            active_status: true,
          };

          const user = await this.create(userData);
          imported.push(user.id);
        } catch (error: any) {
          const errorMessage = error?.message || 'Unknown error';
          errors.push(`Dòng ${rowNumber}: ${errorMessage}`);
        }
      }

      return {
        success: imported.length > 0,
        message: `Đã import ${imported.length} võ sinh thành công, ${errors.length} lỗi`,
        imported: imported.length,
        failed: errors.length,
        errors,
      };
    } catch (error: any) {
      this.logger.error('Error importing users from Excel:', error);
      throw new BadRequestException(
        error?.message || 'Error importing users from Excel file',
      );
    }
  }
}
