import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './auth.controller';
import { Admin } from './entities/admin.entity';
import { Coach } from '../coaches/entities/coach.entity';
import { User } from '../users/entities/user.entity';
import { Parent } from '../parents/entities/parent.entity';
import { UsersService } from '../users/users.service';
import { ParentsService } from '../parents/parents.service';
import * as fs from 'fs';
import * as path from 'path';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    private readonly usersService: UsersService,
    private readonly parentsService: ParentsService,
  ) {}

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
      let { email, username, ma_hoi_vien, phone, password } = loginDto;

      // Trim whitespace
      email = email?.trim() || '';
      username = username?.trim() || '';
      ma_hoi_vien = ma_hoi_vien?.trim() || '';
      phone = phone?.trim() || '';
      password = password?.trim() || '';

      // Determine login identifier - hỗ trợ đăng nhập bằng email, username, phone, hoặc ma_hoi_vien
      // Người dùng có thể nhập bất kỳ giá trị nào vào trường "email" trong form
      // Backend sẽ tự động detect và tìm kiếm trong tất cả các trường
      let loginIdentifier: string = '';

      // Ưu tiên: email > ma_hoi_vien > phone > username
      // Nhưng nếu chỉ có 1 trường được nhập, sử dụng giá trị đó và tìm kiếm trong tất cả các trường
      if (email) {
        loginIdentifier = email.trim();
      } else if (ma_hoi_vien) {
        loginIdentifier = ma_hoi_vien.trim();
      } else if (phone) {
        loginIdentifier = phone.trim();
      } else if (username) {
        loginIdentifier = username.trim();
      }

      // Xác định loginType dựa trên format của loginIdentifier
      // Ưu tiên kiểm tra: ma_hoi_vien > email > phone > username
      let loginType: 'email' | 'username' | 'ma_hoi_vien' | 'phone' = 'email';

      // Kiểm tra format để xác định loại (ưu tiên ma_hoi_vien trước email)
      // Mã hội viên có thể bắt đầu bằng HV_ (võ sinh) hoặc HLV_ (huấn luyện viên)
      // Hoặc có thể là mã hội viên không có prefix (như "huân_luyen_vien")
      if (loginIdentifier.match(/^(HV_|HLV_)/i)) {
        // Bắt đầu bằng HV_ hoặc HLV_ -> mã hội viên (ưu tiên cao nhất)
        loginType = 'ma_hoi_vien';
      } else if (loginIdentifier.includes('@')) {
        // Có ký tự @ -> email
        loginType = 'email';
      } else if (loginIdentifier.match(/^[0-9]+$/)) {
        // Chỉ có số -> phone
        loginType = 'phone';
      } else {
        // Khác -> username (có thể là ho_va_ten hoặc ma_hoi_vien không có prefix)
        // Logic tìm kiếm sẽ tìm trong cả hai trường
        loginType = 'username';
      }

      console.log('[Auth Debug] Login type detection:', {
        loginIdentifier,
        detectedLoginType: loginType,
        hasEmailChar: loginIdentifier.includes('@'),
        hasPrefix: !!loginIdentifier.match(/^(HV_|HLV_)/i),
        isNumeric: !!loginIdentifier.match(/^[0-9]+$/),
      });

      // Validate input data
      if (!loginIdentifier || !password) {
        throw new BadRequestException(
          'Email/Phone/Username/Mã hội viên and password are required',
        );
      }

      console.log('[Auth Debug] Login request received:', {
        loginIdentifier,
        loginType,
        passwordLength: password?.length || 0,
        email,
        username,
        ma_hoi_vien,
        phone,
        timestamp: new Date().toISOString(),
      });

      // Check admin table first (only by email format)
      // Lưu ý: Bảng admin có thể không tồn tại trong database
      // Admin thường được lưu trong bảng huan_luyen_vien với role 'owner' hoặc 'admin'
      let admin: Admin | null = null;
      // Chỉ kiểm tra admin nếu loginIdentifier có format email
      if (loginIdentifier.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(loginIdentifier)) {
          try {
            // Tìm với email (case-insensitive)
            // Wrap trong try-catch vì bảng admin có thể không tồn tại
            admin = await this.adminRepository
              .createQueryBuilder('admin')
              .where('LOWER(admin.email) = LOWER(:loginIdentifier)', {
                loginIdentifier,
              })
              .select([
                'admin.id',
                'admin.name',
                'admin.email',
                'admin.password',
                'admin.role',
                'admin.phone',
                'admin.active_status',
              ])
              .getOne();
          } catch (error: any) {
            // Bảng admin không tồn tại, bỏ qua và tiếp tục tìm trong bảng khác
            if (error?.code === 'ER_NO_SUCH_TABLE' || error?.errno === 1146) {
              console.log(
                '[Auth Debug] Admin table does not exist, skipping admin check',
              );
              admin = null;
            } else {
              // Lỗi khác, log và tiếp tục
              console.error('[Auth Debug] Error checking admin table:', error);
              admin = null;
            }
          }
        }
      }

      if (admin && admin.active_status && admin.password) {
        // So sánh plain text password (không dùng bcrypt)
        const normalizedInputPassword = password.trim();
        const normalizedDbPassword = admin.password.trim();

        console.log('[Auth Debug] Admin login attempt:', {
          loginIdentifier,
          loginType,
          email: admin.email,
          hasPassword: !!admin.password,
          inputPasswordLength: normalizedInputPassword.length,
          dbPasswordLength: normalizedDbPassword.length,
        });

        // So sánh case-sensitive và case-insensitive
        const isPasswordValid =
          normalizedDbPassword === normalizedInputPassword ||
          normalizedDbPassword.toLowerCase() ===
            normalizedInputPassword.toLowerCase();

        console.log('[Auth Debug] Admin password comparison result:', {
          loginIdentifier,
          loginType,
          isPasswordValid,
        });

        if (isPasswordValid) {
          // Remove password from response
          const { password: _, ...adminWithoutPassword } = admin;
          return {
            success: true,
            message: 'Login successful',
            data: {
              user: {
                id: adminWithoutPassword.id,
                name: adminWithoutPassword.name || '',
                email: adminWithoutPassword.email || '',
                role: adminWithoutPassword.role || 'admin',
                phone: adminWithoutPassword.phone || '',
              },
              token: 'dummy-token', // TODO: Implement JWT token generation
            },
          };
        }
      }

      // Check coaches table (huan_luyen_vien) TRƯỚC users table
      // Để ưu tiên HLV khi có email/mã hội viên trùng
      // HLV đăng nhập sẽ được đưa vào admin, võ sinh vào trang user
      let coach: Coach | null = null;

      console.log(
        '[Auth Debug] Bắt đầu tìm kiếm Coach (HLV) với loginIdentifier:',
        loginIdentifier,
      );

      // Ưu tiên tìm Coach (HLV) trước
      if (loginType === 'ma_hoi_vien') {
        // Tìm với ma_hoi_vien (case-insensitive)
        coach = await this.coachRepository
          .createQueryBuilder('coach')
          .where('LOWER(coach.ma_hoi_vien) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'coach.id',
            'coach.ma_hoi_vien',
            'coach.ho_va_ten',
            'coach.email',
            'coach.password',
            'coach.role',
            'coach.phone',
            'coach.is_active',
          ])
          .getOne();
      } else if (loginType === 'email') {
        // Tìm với email (case-insensitive)
        coach = await this.coachRepository
          .createQueryBuilder('coach')
          .where('LOWER(coach.email) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'coach.id',
            'coach.ma_hoi_vien',
            'coach.ho_va_ten',
            'coach.email',
            'coach.password',
            'coach.role',
            'coach.phone',
            'coach.is_active',
          ])
          .getOne();
      } else if (loginType === 'phone') {
        coach = await this.coachRepository.findOne({
          where: { phone: loginIdentifier },
          select: [
            'id',
            'ma_hoi_vien',
            'ho_va_ten',
            'email',
            'password',
            'role',
            'phone',
            'is_active',
          ],
        });
      } else if (loginType === 'username') {
        // Tìm với ho_va_ten HOẶC ma_hoi_vien (case-insensitive)
        // Vì username có thể là tên hoặc mã hội viên không có prefix
        coach = await this.coachRepository
          .createQueryBuilder('coach')
          .where(
            '(LOWER(coach.ho_va_ten) = LOWER(:loginIdentifier) OR LOWER(coach.ma_hoi_vien) = LOWER(:loginIdentifier))',
            {
              loginIdentifier,
            },
          )
          .select([
            'coach.id',
            'coach.ma_hoi_vien',
            'coach.ho_va_ten',
            'coach.email',
            'coach.password',
            'coach.role',
            'coach.phone',
            'coach.is_active',
          ])
          .getOne();
      }

      // Nếu chưa tìm thấy Coach, thử tìm lại trong tất cả các trường (fallback)
      // Đảm bảo tìm trong tất cả các trường có thể: ma_hoi_vien, email, phone, ho_va_ten
      if (!coach) {
        // Tìm với ma_hoi_vien (case-insensitive)
        coach = await this.coachRepository
          .createQueryBuilder('coach')
          .where('LOWER(coach.ma_hoi_vien) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'coach.id',
            'coach.ma_hoi_vien',
            'coach.ho_va_ten',
            'coach.email',
            'coach.password',
            'coach.role',
            'coach.phone',
            'coach.is_active',
          ])
          .getOne();
      }

      if (!coach) {
        // Tìm với email (case-insensitive)
        coach = await this.coachRepository
          .createQueryBuilder('coach')
          .where('LOWER(coach.email) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'coach.id',
            'coach.ma_hoi_vien',
            'coach.ho_va_ten',
            'coach.email',
            'coach.password',
            'coach.role',
            'coach.phone',
            'coach.is_active',
          ])
          .getOne();
      }

      if (!coach) {
        // Tìm với phone
        coach = await this.coachRepository.findOne({
          where: { phone: loginIdentifier },
          select: [
            'id',
            'ma_hoi_vien',
            'ho_va_ten',
            'email',
            'password',
            'role',
            'phone',
            'is_active',
          ],
        });
      }

      if (!coach) {
        // Tìm với ho_va_ten (case-insensitive) - fallback cuối cùng
        coach = await this.coachRepository
          .createQueryBuilder('coach')
          .where('LOWER(coach.ho_va_ten) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'coach.id',
            'coach.ma_hoi_vien',
            'coach.ho_va_ten',
            'coach.email',
            'coach.password',
            'coach.role',
            'coach.phone',
            'coach.is_active',
          ])
          .getOne();
      }

      console.log('[Auth Debug] Kết quả tìm kiếm Coach:', {
        loginIdentifier,
        loginType,
        foundCoach: !!coach,
        coachId: coach?.id,
        coachEmail: coach?.email,
        coachMaHoiVien: coach?.ma_hoi_vien,
        coachHoVaTen: coach?.ho_va_ten,
        coachRole: coach?.role,
        coachIsActive: coach?.is_active,
        coachHasPassword: !!coach?.password,
        // Log chi tiết hơn để debug
        searchFields: {
          searchedInHoVaTen: loginType === 'username' || !coach,
          searchedInMaHoiVien:
            loginType === 'ma_hoi_vien' || loginType === 'username' || !coach,
          searchedInEmail: loginType === 'email' || !coach,
          searchedInPhone: loginType === 'phone' || !coach,
        },
      });

      // Kiểm tra Coach (HLV) trước
      if (coach && coach.is_active && coach.password) {
        const normalizedInputPassword = password.trim();
        const normalizedDbPassword = coach.password.trim();

        console.log('[Auth Debug] Coach (HLV) login attempt:', {
          loginIdentifier,
          loginType,
          email: coach.email,
          ma_hoi_vien: coach.ma_hoi_vien,
          ho_va_ten: coach.ho_va_ten,
          hasPassword: !!coach.password,
          inputPasswordLength: normalizedInputPassword.length,
          dbPasswordLength: normalizedDbPassword.length,
        });

        const isPasswordValid =
          normalizedDbPassword === normalizedInputPassword ||
          normalizedDbPassword.toLowerCase() ===
            normalizedInputPassword.toLowerCase();

        console.log('[Auth Debug] Coach password comparison:', {
          loginIdentifier,
          loginType,
          isPasswordValid,
          inputPassword: normalizedInputPassword.substring(0, 3) + '***', // Chỉ log 3 ký tự đầu để bảo mật
          dbPassword: normalizedDbPassword.substring(0, 3) + '***',
          exactMatch: normalizedDbPassword === normalizedInputPassword,
          caseInsensitiveMatch:
            normalizedDbPassword.toLowerCase() ===
            normalizedInputPassword.toLowerCase(),
        });

        if (isPasswordValid) {
          const { password: _, ...coachWithoutPassword } = coach;
          const coachRole =
            coachWithoutPassword.role === 'owner' ? 'owner' : 'admin';
          console.log('[Auth Debug] Coach login successful:', {
            id: coachWithoutPassword.id,
            name: coachWithoutPassword.ho_va_ten,
            email: coachWithoutPassword.email,
            role: coachRole,
            ma_hoi_vien: coachWithoutPassword.ma_hoi_vien,
          });
          return {
            success: true,
            message: 'Login successful',
            data: {
              user: {
                id: coachWithoutPassword.id,
                name: coachWithoutPassword.ho_va_ten || '',
                email: coachWithoutPassword.email || '',
                role: coachRole, // HLV đăng nhập sẽ được đưa vào admin
                phone: coachWithoutPassword.phone || '',
                ma_hoi_vien: coachWithoutPassword.ma_hoi_vien || '',
              },
              token: 'dummy-token',
            },
          };
        } else {
          console.log('[Auth Debug] Coach password không khớp:', {
            loginIdentifier,
            loginType,
            coachEmail: coach.email,
            coachMaHoiVien: coach.ma_hoi_vien,
          });
        }
      } else {
        console.log('[Auth Debug] Coach không tìm thấy hoặc không hợp lệ:', {
          loginIdentifier,
          loginType,
          foundCoach: !!coach,
          coachActive: coach?.is_active,
          coachHasPassword: !!coach?.password,
        });
      }

      // Sau đó mới check vo_sinh (users) table - hỗ trợ đăng nhập bằng email, phone, ho_va_ten (username), hoặc ma_hoi_vien
      let user: User | null = null;

      // Tìm kiếm theo loginType để tối ưu hiệu suất
      if (loginType === 'ma_hoi_vien') {
        // Ưu tiên tìm với ma_hoi_vien trước (case-insensitive)
        user = await this.userRepository
          .createQueryBuilder('user')
          .where('LOWER(user.ma_hoi_vien) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'user.id',
            'user.ho_va_ten',
            'user.email',
            'user.password',
            'user.phone',
            'user.active_status',
            'user.ma_hoi_vien',
          ])
          .getOne();
      } else if (loginType === 'email') {
        // Tìm với email (case-insensitive)
        user = await this.userRepository
          .createQueryBuilder('user')
          .where('LOWER(user.email) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'user.id',
            'user.ho_va_ten',
            'user.email',
            'user.password',
            'user.phone',
            'user.active_status',
            'user.ma_hoi_vien',
          ])
          .getOne();
      } else if (loginType === 'phone') {
        // Tìm với phone
        user = await this.userRepository.findOne({
          where: { phone: loginIdentifier },
          select: [
            'id',
            'ho_va_ten',
            'email',
            'password',
            'phone',
            'active_status',
            'ma_hoi_vien',
          ],
        });
      } else {
        // Tìm với ho_va_ten (username)
        user = await this.userRepository.findOne({
          where: { ho_va_ten: loginIdentifier },
          select: [
            'id',
            'ho_va_ten',
            'email',
            'password',
            'phone',
            'active_status',
            'ma_hoi_vien',
          ],
        });
      }

      // Nếu chưa tìm thấy, thử tìm lại trong TẤT CẢ các trường (fallback)
      // Để đảm bảo không bỏ sót trường hợp nào
      if (!user) {
        // Tìm với ma_hoi_vien (case-insensitive) - không cần kiểm tra format
        user = await this.userRepository
          .createQueryBuilder('user')
          .where('LOWER(user.ma_hoi_vien) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'user.id',
            'user.ho_va_ten',
            'user.email',
            'user.password',
            'user.phone',
            'user.active_status',
            'user.ma_hoi_vien',
          ])
          .getOne();
      }

      if (!user) {
        // Tìm với email (case-insensitive)
        user = await this.userRepository
          .createQueryBuilder('user')
          .where('LOWER(user.email) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'user.id',
            'user.ho_va_ten',
            'user.email',
            'user.password',
            'user.phone',
            'user.active_status',
            'user.ma_hoi_vien',
          ])
          .getOne();
      }

      if (!user) {
        // Tìm với phone
        user = await this.userRepository.findOne({
          where: { phone: loginIdentifier },
          select: [
            'id',
            'ho_va_ten',
            'email',
            'password',
            'phone',
            'active_status',
            'ma_hoi_vien',
          ],
        });
      }

      if (!user) {
        // Tìm với ho_va_ten (username)
        user = await this.userRepository.findOne({
          where: { ho_va_ten: loginIdentifier },
          select: [
            'id',
            'ho_va_ten',
            'email',
            'password',
            'phone',
            'active_status',
            'ma_hoi_vien',
          ],
        });
      }

      console.log(
        '[Auth Debug] User search result (email/phone/ho_va_ten/ma_hoi_vien):',
        {
          loginIdentifier,
          foundUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          userPhone: user?.phone,
          userHoVaTen: user?.ho_va_ten,
          userMaHoiVien: user?.ma_hoi_vien,
          hasPassword: !!user?.password,
          activeStatus: user?.active_status,
        },
      );

      if (user && user.active_status && user.password) {
        // So sánh plain text password (không dùng bcrypt)
        const normalizedInputPassword = password.trim();
        const normalizedDbPassword = user.password.trim();

        console.log(
          '[Auth Debug] User (võ sinh) login attempt với plain text password:',
          {
            loginIdentifier,
            loginType,
            email: user.email,
            ho_va_ten: user.ho_va_ten,
            ma_hoi_vien: user.ma_hoi_vien,
            dbPasswordLength: normalizedDbPassword.length,
            inputPasswordLength: normalizedInputPassword.length,
          },
        );

        // So sánh case-sensitive và case-insensitive
        const isPasswordValid =
          normalizedDbPassword === normalizedInputPassword ||
          normalizedDbPassword.toLowerCase() ===
            normalizedInputPassword.toLowerCase();

        console.log('[Auth Debug] User password comparison result:', {
          loginIdentifier,
          loginType,
          isPasswordValid,
          userFound: true,
          userActive: user.active_status,
          hasPassword: !!user.password,
        });

        if (isPasswordValid) {
          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;
          return {
            success: true,
            message: 'Login successful',
            data: {
              user: {
                id: userWithoutPassword.id,
                name: userWithoutPassword.ho_va_ten || '',
                email: userWithoutPassword.email || '',
                role: 'student',
                phone: userWithoutPassword.phone || '',
                ma_hoi_vien: userWithoutPassword.ma_hoi_vien || '',
              },
              token: 'dummy-token', // TODO: Implement JWT token generation
            },
          };
        } else {
          console.log('[Auth Debug] Password không khớp:', {
            loginIdentifier,
            loginType,
            dbPasswordLength: normalizedDbPassword.length,
            inputPasswordLength: normalizedInputPassword.length,
          });
        }
      } else {
        console.log('[Auth Debug] User không hợp lệ hoặc không có password:', {
          loginIdentifier,
          hasUser: !!user,
          userActive: user?.active_status,
          hasPassword: !!user?.password,
        });
      }

      // Check parents table - support email only (parents don't have ma_hoi_vien or username)
      let parent: Parent | null = null;
      if (loginType === 'email') {
        // Tìm với email (case-insensitive)
        parent = await this.parentRepository
          .createQueryBuilder('parent')
          .where('LOWER(parent.email) = LOWER(:loginIdentifier)', {
            loginIdentifier,
          })
          .select([
            'parent.id',
            'parent.name',
            'parent.email',
            'parent.password',
            'parent.phone',
            'parent.active_status',
            'parent.relationship',
          ])
          .getOne();

        // Debug logging for parent login
        console.log('[Auth Debug] Searching parent by email:', {
          loginIdentifier,
          foundParent: !!parent,
          parentId: parent?.id,
          parentEmail: parent?.email,
          hasPassword: !!parent?.password,
          activeStatus: parent?.active_status,
        });
      }

      if (parent && parent.active_status && parent.password) {
        // So sánh plain text password (không dùng bcrypt)
        const normalizedInputPassword = password.trim();
        const normalizedDbPassword = parent.password.trim();

        console.log('[Auth Debug] Parent login attempt:', {
          loginIdentifier,
          loginType,
          email: parent.email,
          name: parent.name,
          hasPassword: !!parent.password,
          inputPasswordLength: normalizedInputPassword.length,
          dbPasswordLength: normalizedDbPassword.length,
        });

        // So sánh case-sensitive và case-insensitive
        const isPasswordValid =
          normalizedDbPassword === normalizedInputPassword ||
          normalizedDbPassword.toLowerCase() ===
            normalizedInputPassword.toLowerCase();

        console.log('[Auth Debug] Parent password comparison result:', {
          loginIdentifier,
          loginType,
          isPasswordValid,
        });

        if (isPasswordValid) {
          // Remove password from response
          const { password: _, ...parentWithoutPassword } = parent;
          return {
            success: true,
            message: 'Login successful',
            data: {
              user: {
                id: parentWithoutPassword.id,
                name: parentWithoutPassword.name || '',
                email: parentWithoutPassword.email || '',
                role: 'parent',
                phone: parentWithoutPassword.phone || '',
                relationship: parentWithoutPassword.relationship || '',
              },
              token: 'dummy-token', // TODO: Implement JWT token generation
            },
          };
        }
      } else {
        console.log('[Auth Debug] Parent not found or inactive:', {
          loginIdentifier,
          loginType,
          hasParent: !!parent,
          hasActiveStatus: parent?.active_status,
          hasPassword: !!parent?.password,
        });
      }

      // If no user found or password invalid
      console.log(
        '[Auth Debug] Login failed - no valid user or password mismatch:',
        {
          loginIdentifier,
          loginType,
          checkedAdmin: !!admin,
          checkedUser: !!user,
          checkedCoach: !!coach,
          checkedParent: !!parent,
          adminActive: admin?.active_status,
          userActive: user?.active_status,
          coachActive: coach?.is_active,
          parentActive: parent?.active_status,
          adminHasPassword: !!admin?.password,
          userHasPassword: !!user?.password,
          coachHasPassword: !!coach?.password,
          parentHasPassword: !!parent?.password,
        },
      );

      // Provide more specific error message
      if (admin && !admin.active_status) {
        throw new UnauthorizedException({
          message: 'Account is inactive',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      if (user && !user.active_status) {
        throw new UnauthorizedException({
          message: 'Account is inactive',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      if (coach && !coach.is_active) {
        throw new UnauthorizedException({
          message: 'Account is inactive',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      if (parent && !parent.active_status) {
        throw new UnauthorizedException({
          message: 'Account is inactive',
          error: 'Unauthorized',
          statusCode: 401,
        });
      }

      // Trả về error message rõ ràng hơn
      const errorDetails: any = {
        message: 'Invalid email/phone/username/mã hội viên or password',
        error: 'Unauthorized',
        statusCode: 401,
      };

      // Thêm thông tin debug nếu có user được tìm thấy nhưng password sai
      if (user && user.active_status) {
        errorDetails.details = 'User found but password does not match';
        console.log('[Auth Debug] User found but password mismatch:', {
          loginIdentifier,
          userId: user.id,
          userEmail: user.email,
          userMaHoiVien: user.ma_hoi_vien,
        });
      } else if (user && !user.active_status) {
        errorDetails.details = 'User account is inactive';
        console.log('[Auth Debug] User found but inactive:', {
          loginIdentifier,
          userId: user.id,
        });
      } else if (admin && admin.active_status) {
        errorDetails.details = 'Admin found but password does not match';
        console.log('[Auth Debug] Admin found but password mismatch:', {
          loginIdentifier,
          adminId: admin.id,
          adminEmail: admin.email,
        });
      } else if (coach && coach.is_active) {
        errorDetails.details = 'Coach found but password does not match';
        console.log('[Auth Debug] Coach found but password mismatch:', {
          loginIdentifier,
          coachId: coach.id,
          coachEmail: coach.email,
          coachMaHoiVien: coach.ma_hoi_vien,
          coachHoVaTen: coach.ho_va_ten,
        });
      } else if (coach && !coach.is_active) {
        errorDetails.details = 'Coach account is inactive';
        console.log('[Auth Debug] Coach found but inactive:', {
          loginIdentifier,
          coachId: coach.id,
          coachEmail: coach.email,
        });
      } else if (parent && parent.active_status) {
        errorDetails.details = 'Parent found but password does not match';
        console.log('[Auth Debug] Parent found but password mismatch:', {
          loginIdentifier,
          parentId: parent.id,
        });
      } else {
        errorDetails.details = 'No user found with provided credentials';
        console.log('[Auth Debug] No account found:', {
          loginIdentifier,
          loginType,
          searchedInCoach: true,
          searchedInUser: true,
          searchedInAdmin: true,
          searchedInParent: true,
        });
      }

      throw new UnauthorizedException(errorDetails);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('[Auth Error] Unexpected error during login:', error);
      throw new UnauthorizedException({
        message: 'Invalid email/phone/username/mã hội viên or password',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const { name, email, password, phone, role } = registerDto;

      if (!name || !email || !password) {
        throw new BadRequestException('Name, email and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Check if email already exists in admin table
      const existingAdmin = await this.adminRepository.findOne({
        where: { email },
      });
      if (existingAdmin) {
        throw new ConflictException('Email already exists');
      }

      // Check if email already exists in coach table
      const existingCoach = await this.coachRepository.findOne({
        where: { email },
      });
      if (existingCoach) {
        throw new ConflictException('Email already exists');
      }

      const userRole = role || 'student';

      // Register based on role
      if (userRole === 'student') {
        // Check if email exists in users table
        try {
          await this.usersService.findByEmail(email);
          // If no exception, email exists
          throw new ConflictException('Email already exists');
        } catch (error) {
          // If NotFoundException, email doesn't exist - continue
          if (error instanceof ConflictException) {
            throw error;
          }

          // Email không tồn tại, tiếp tục tạo user
          // usersService.create sẽ lưu password plain text
          const newUser = await this.usersService.create({
            ho_va_ten: name,
            email: email,
            password: password,
            phone: phone || undefined,
            ma_hoi_vien: `SV${Date.now()}`, // Generate temporary member code
            ma_clb: 'DEFAULT', // Default club code
            ma_don_vi: 'DEFAULT', // Default branch code
            quyen_so: 0, // Default
            cap_dai_id: 1, // Default belt level
            gioi_tinh: 'Nam', // Default
            ngay_thang_nam_sinh: new Date().toISOString(), // Default date
            active_status: true,
          });

          return {
            success: true,
            message: 'Registration successful',
            data: {
              user: {
                id: newUser.id,
                name: newUser.ho_va_ten,
                email: newUser.email,
                phone: newUser.phone,
                role: 'student',
              },
            },
          };
        }
      } else if (userRole === 'parent') {
        // Check if email exists in parents, admin, coaches, or users table
        const existingParent = await this.parentRepository.findOne({
          where: { email: email },
        });
        if (existingParent) {
          throw new ConflictException('Email already exists');
        }

        // Check if email exists in admin table
        const existingAdmin = await this.adminRepository.findOne({
          where: { email: email },
        });
        if (existingAdmin) {
          throw new ConflictException('Email already exists');
        }

        // Check if email exists in coaches table
        const existingCoach = await this.coachRepository.findOne({
          where: { email: email },
        });
        if (existingCoach) {
          throw new ConflictException('Email already exists');
        }

        // Check if email exists in users table
        const existingUser = await this.userRepository.findOne({
          where: { email: email },
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }

        // Lưu password plain text (không hash)
        const newParent = await this.parentRepository.save({
          name: name,
          email: email,
          phone: phone || undefined,
          password: password, // Lưu plain text
          active_status: true,
          relationship: 'other',
          emergency_contact: false,
        });

        return {
          success: true,
          message: 'Registration successful',
          data: {
            user: {
              id: newParent.id,
              name: newParent.name,
              email: newParent.email,
              phone: newParent.phone,
              role: 'parent',
            },
          },
        };
      } else {
        throw new BadRequestException(
          `Invalid role: ${userRole}. Only 'student' or 'parent' are allowed for registration.`,
        );
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new ConflictException('Registration failed. Please try again.');
    }
  }

  async getProfile(req: any) {
    try {
      // TODO: Implement JWT token validation
      // Extract user from JWT token
      // For now, return error as this is not implemented
      throw new UnauthorizedException(
        'Profile endpoint not implemented. Please login to get user information.',
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async uploadAvatar(file: MulterFile, userId?: string, userRole?: string) {
    try {
      console.log('[Auth Service] Upload avatar:', {
        fileName: file.originalname,
        fileSize: file.size,
        fileMimeType: file.mimetype,
        userId,
        userRole,
      });

      // Tạo thư mục client/images/users nếu chưa tồn tại
      // Lưu file vào thư mục này để phù hợp với database schema (đường dẫn bắt đầu từ client/images/)
      const clientImagesDir = path.join(process.cwd(), 'client', 'images', 'users');
      if (!fs.existsSync(clientImagesDir)) {
        fs.mkdirSync(clientImagesDir, { recursive: true });
      }

      // Tạo tên file unique
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const filePath = path.join(clientImagesDir, fileName);

      // Lưu file với error handling
      try {
        fs.writeFileSync(filePath, file.buffer);
        console.log('[Auth Service] File saved successfully:', filePath);
      } catch (writeError) {
        console.error('[Auth Service] Error writing file:', writeError);
        throw new BadRequestException('Failed to save file to disk');
      }

      // Tạo đường dẫn theo format client/images/... để lưu vào database
      // Đường dẫn này phù hợp với database schema: "đường dẫn bắt đầu từ client/images"
      const fileUrl = `client/images/users/${fileName}`;

      if (!userId) {
        // Nếu không có userId, trả về URL để frontend tự xử lý
        return {
          success: true,
          message: 'Avatar uploaded successfully',
          data: {
            avatar: fileUrl,
            profile_image_url: fileUrl,
            photo_url: fileUrl,
          },
        };
      }

      // Cập nhật avatar trong database dựa trên role
      if (userRole === 'admin' || userRole === 'owner') {
        // Tìm coach với ID
        const coachId = parseInt(userId);
        console.log('[Auth Service] Looking for coach with ID:', coachId);

        const coach = await this.coachRepository.findOne({
          where: { id: coachId },
        });

        console.log('[Auth Service] Coach found:', {
          found: !!coach,
          coachId: coach?.id,
          coachEmail: coach?.email,
          currentImages: coach?.images,
        });

        if (coach) {
          // Parse cột images (JSON array) hoặc tạo array mới
          let imagesArray: string[] = [];
          try {
            if (coach.images) {
              imagesArray = JSON.parse(coach.images);
              if (!Array.isArray(imagesArray)) {
                console.warn(
                  '[Auth Service] Images is not an array, creating new array',
                );
                imagesArray = [];
              }
            }
          } catch (parseError) {
            console.error(
              '[Auth Service] Error parsing images JSON:',
              parseError,
            );
            console.log('[Auth Service] Current images value:', coach.images);
            imagesArray = [];
          }

          // Xóa avatar cũ khỏi images array (nếu có)
          // Giữ lại các ảnh khác, chỉ thay thế avatar đầu tiên hoặc thêm mới
          if (imagesArray.length > 0) {
            // Xóa file cũ nếu có (ảnh đầu tiên thường là avatar)
            const oldImageUrl = imagesArray[0];
            if (oldImageUrl) {
              // Hỗ trợ cả đường dẫn cũ (/uploads/avatars/) và đường dẫn mới (client/images/)
              let oldFilePath: string;
              if (oldImageUrl.startsWith('client/images/')) {
                oldFilePath = path.join(process.cwd(), oldImageUrl);
              } else if (oldImageUrl.startsWith('/uploads/avatars/')) {
                oldFilePath = path.join(process.cwd(), oldImageUrl);
              } else if (oldImageUrl.startsWith('/')) {
                // Nếu là đường dẫn tuyệt đối khác, thử với process.cwd()
                oldFilePath = path.join(process.cwd(), oldImageUrl.substring(1));
              } else {
                // Nếu là đường dẫn tương đối
                oldFilePath = path.join(process.cwd(), oldImageUrl);
              }
              
              if (fs.existsSync(oldFilePath)) {
                try {
                  fs.unlinkSync(oldFilePath);
                  console.log('[Auth Service] Deleted old avatar file:', oldFilePath);
                } catch (error) {
                  console.error('Error deleting old avatar file:', error);
                }
              }
            }
            // Thay thế ảnh đầu tiên bằng avatar mới
            imagesArray[0] = fileUrl;
          } else {
            // Nếu chưa có ảnh nào, thêm avatar mới
            imagesArray = [fileUrl];
          }

          // Chuẩn bị dữ liệu để lưu vào database
          // Chuyển mảng ảnh sang JSON string trước khi insert vào database
          // Format: ["client/images/users/file1.jpg", "client/images/users/file2.png", ...]
          const imagesJsonString = JSON.stringify(imagesArray);
          
          console.log('[Auth Service] Updating coach images:', {
            coachId,
            oldImages: coach.images,
            newImagesArray: imagesArray,
            newImagesJson: imagesJsonString,
            fileUrl,
            photoUrl: fileUrl,
            fileExtension: path.extname(fileUrl),
          });
          
          // Verify JSON string format
          try {
            const testParse = JSON.parse(imagesJsonString);
            if (!Array.isArray(testParse)) {
              throw new Error('imagesJsonString is not a valid JSON array');
            }
            console.log('[Auth Service] JSON string validation passed:', {
              isArray: Array.isArray(testParse),
              length: testParse.length,
              firstItem: testParse[0],
            });
          } catch (parseError) {
            console.error('[Auth Service] JSON string validation failed:', parseError);
            throw new BadRequestException('Failed to create valid JSON string for images array');
          }

          // Cập nhật chỉ các field cần thiết bằng update() để tránh lỗi club_id
          // Không dùng save() vì nó sẽ trigger relation với club/branch và gây lỗi nếu database không có club_id
          try {
            const updateResult = await this.coachRepository.update(coachId, {
              images: imagesJsonString,
              photo_url: fileUrl,
            });
            
            console.log('[Auth Service] Update result:', {
              affected: updateResult.affected,
              generatedMaps: updateResult.generatedMaps,
              raw: updateResult.raw,
            });
            
            // Verify update thành công bằng cách query lại
            const updatedCoach = await this.coachRepository.findOne({
              where: { id: coachId },
              select: ['id', 'images', 'photo_url'],
            });
            
            console.log('[Auth Service] Verified coach after update:', {
              coachId: updatedCoach?.id,
              images: updatedCoach?.images,
              photo_url: updatedCoach?.photo_url,
              imagesParsed: updatedCoach?.images ? JSON.parse(updatedCoach.images) : null,
            });
            
            if (!updatedCoach || updatedCoach.images !== imagesJsonString || updatedCoach.photo_url !== fileUrl) {
              console.error('[Auth Service] Update verification failed:', {
                expectedImages: imagesJsonString,
                actualImages: updatedCoach?.images,
                expectedPhotoUrl: fileUrl,
                actualPhotoUrl: updatedCoach?.photo_url,
              });
              throw new BadRequestException('Database update verification failed');
            }
            
            console.log('[Auth Service] Coach updated successfully and verified');
          } catch (saveError: any) {
            console.error('[Auth Service] Error saving coach:', saveError);
            console.error('[Auth Service] Error details:', {
              message: saveError?.message,
              sql: saveError?.sql,
              code: saveError?.code,
              stack: saveError?.stack,
            });
            throw new BadRequestException(
              `Failed to update coach in database: ${saveError?.message || 'Unknown error'}`,
            );
          }

          return {
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
              avatar: fileUrl,
              profile_image_url: fileUrl,
              photo_url: fileUrl,
              user: {
                id: coach.id,
                name: coach.ho_va_ten,
                email: coach.email,
                role: coach.role,
                avatar: fileUrl,
              },
            },
          };
        }
      }

      // Nếu không tìm thấy coach, thử tìm admin
      const adminId = parseInt(userId);
      const admin = await this.adminRepository.findOne({
        where: { id: adminId },
      });

      if (admin) {
        // Admin không có photo_url trong entity, có thể cần thêm field này
        // Tạm thời trả về URL
        return {
          success: true,
          message: 'Avatar uploaded successfully',
          data: {
            avatar: fileUrl,
            profile_image_url: fileUrl,
            photo_url: fileUrl,
            user: {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: admin.role,
              avatar: fileUrl,
            },
          },
        };
      }

      // Nếu không tìm thấy user, vẫn trả về URL
      return {
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar: fileUrl,
          profile_image_url: fileUrl,
          photo_url: fileUrl,
        },
      };
    } catch (error) {
      console.error('[Auth Service] Error uploading avatar:', error);
      console.error('[Auth Service] Error details:', {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        userId,
        userRole,
      });
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to upload avatar',
      );
    }
  }
}
