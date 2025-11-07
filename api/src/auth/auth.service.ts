import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.controller';
import { Admin } from './entities/admin.entity';
import { Coach } from '../coaches/entities/coach.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ParentsService } from '../parents/parents.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      let { email, password } = loginDto;

      // Trim whitespace from email and password
      email = email?.trim() || '';
      password = password?.trim() || '';

      // Validate input data
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      console.log('[Auth Debug] Login request received:', {
        email,
        passwordLength: password?.length || 0,
        timestamp: new Date().toISOString(),
      });

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Check admin table first
      const admin = await this.adminRepository.findOne({
        where: { email },
        select: [
          'id',
          'name',
          'email',
          'password',
          'role',
          'phone',
          'active_status',
        ],
      });

      if (admin && admin.active_status) {
        // Verify password
        // Handle both $2a$ and $2y$ bcrypt formats
        let passwordHash = admin.password;

        // Validate hash format
        if (!passwordHash || typeof passwordHash !== 'string') {
          console.log('[Auth Debug] Admin has invalid password hash:', {
            email,
            hasPassword: !!admin.password,
            passwordType: typeof admin.password,
          });
        } else if (passwordHash.length < 60) {
          console.log('[Auth Debug] Admin password hash too short:', {
            email,
            hashLength: passwordHash.length,
            hashPreview: passwordHash.substring(0, 30),
          });
        } else {
          if (passwordHash.startsWith('$2y$')) {
            // Convert $2y$ to $2a$ for Node.js bcrypt compatibility
            passwordHash = passwordHash.replace('$2y$', '$2a$');
          }

          if (passwordHash) {
            try {
              // Debug logging
              console.log('[Auth Debug] Admin login attempt:', {
                email,
                hasPasswordHash: !!passwordHash,
                hashFormat: passwordHash.substring(0, 7),
                hashLength: passwordHash.length,
                hashPreview: passwordHash.substring(0, 20) + '...',
                passwordLength: password?.length || 0,
              });

              const isPasswordValid = await bcrypt.compare(
                password,
                passwordHash,
              );

              console.log('[Auth Debug] Password comparison result:', {
                email,
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
                      name: adminWithoutPassword.name,
                      email: adminWithoutPassword.email,
                      role: adminWithoutPassword.role,
                      phone: adminWithoutPassword.phone,
                    },
                    token: 'dummy-token', // TODO: Implement JWT token generation
                  },
                };
              }
            } catch (bcryptError) {
              console.error('[Auth Error] Admin bcrypt comparison error:', {
                email,
                error:
                  bcryptError instanceof Error
                    ? bcryptError.message
                    : String(bcryptError),
                hashFormat: passwordHash?.substring(0, 7),
              });
              // Continue to check coaches
            }
          }
        }
      }

      // Check vo_sinh (users) table
      const user = await this.userRepository.findOne({
        where: { email },
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

      if (user && user.active_status && user.password) {
        // Validate hash format
        if (!user.password || typeof user.password !== 'string') {
          console.log('[Auth Debug] User has invalid password hash:', {
            email,
            hasPassword: !!user.password,
            passwordType: typeof user.password,
          });
        } else if (user.password.length < 60) {
          console.log('[Auth Debug] User password hash too short:', {
            email,
            hashLength: user.password.length,
            hashPreview: user.password.substring(0, 30),
          });
        } else {
          try {
            // Verify password with bcrypt
            // Handle both $2a$ and $2y$ bcrypt formats
            let passwordHash = user.password;
            if (passwordHash.startsWith('$2y$')) {
              // Convert $2y$ to $2a$ for Node.js bcrypt compatibility
              passwordHash = passwordHash.replace('$2y$', '$2a$');
            }

            console.log('[Auth Debug] User (võ sinh) login attempt:', {
              email,
              hasPasswordHash: !!passwordHash,
              hashFormat: passwordHash.substring(0, 7),
              hashLength: passwordHash.length,
              hashPreview: passwordHash.substring(0, 20) + '...',
              passwordLength: password?.length || 0,
            });

            const isPasswordValid = await bcrypt.compare(
              password,
              passwordHash,
            );

            console.log('[Auth Debug] User password comparison result:', {
              email,
              isPasswordValid,
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
                    name: userWithoutPassword.ho_va_ten,
                    email: userWithoutPassword.email,
                    role: 'student',
                    phone: userWithoutPassword.phone || '',
                    ma_hoi_vien: userWithoutPassword.ma_hoi_vien,
                  },
                  token: 'dummy-token', // TODO: Implement JWT token generation
                },
              };
            }
          } catch (bcryptError) {
            console.error('[Auth Error] User bcrypt comparison error:', {
              email,
              error:
                bcryptError instanceof Error
                  ? bcryptError.message
                  : String(bcryptError),
              hashFormat: user.password?.substring(0, 7),
            });
            // Continue to check coaches
          }
        }
      }

      // Check coaches table
      const coach = await this.coachRepository.findOne({
        where: { email },
        select: [
          'id',
          'name',
          'email',
          'password',
          'role',
          'phone',
          'is_active',
        ],
      });

      if (coach && coach.is_active && coach.password) {
        // Validate hash format
        if (!coach.password || typeof coach.password !== 'string') {
          console.log('[Auth Debug] Coach has invalid password hash:', {
            email,
            hasPassword: !!coach.password,
            passwordType: typeof coach.password,
          });
        } else if (coach.password.length < 60) {
          console.log('[Auth Debug] Coach password hash too short:', {
            email,
            hashLength: coach.password.length,
            hashPreview: coach.password.substring(0, 30),
          });
        } else {
          try {
            // Verify password with bcrypt
            // Handle both $2a$ and $2y$ bcrypt formats
            let passwordHash = coach.password;
            if (passwordHash.startsWith('$2y$')) {
              // Convert $2y$ to $2a$ for Node.js bcrypt compatibility
              passwordHash = passwordHash.replace('$2y$', '$2a$');
            }

            console.log('[Auth Debug] Coach login attempt:', {
              email,
              hasPasswordHash: !!passwordHash,
              hashFormat: passwordHash.substring(0, 7),
              hashLength: passwordHash.length,
              hashPreview: passwordHash.substring(0, 20) + '...',
              passwordLength: password?.length || 0,
            });

            const isPasswordValid = await bcrypt.compare(
              password,
              passwordHash,
            );

            console.log('[Auth Debug] Coach password comparison result:', {
              email,
              isPasswordValid,
            });

            if (isPasswordValid) {
              // Remove password from response
              const { password: _, ...coachWithoutPassword } = coach;
              return {
                success: true,
                message: 'Login successful',
                data: {
                  user: {
                    id: coachWithoutPassword.id,
                    name: coachWithoutPassword.name || '',
                    email: coachWithoutPassword.email || '',
                    role: 'HLV',
                    phone: coachWithoutPassword.phone || '',
                  },
                  token: 'dummy-token', // TODO: Implement JWT token generation
                },
              };
            }
          } catch (bcryptError) {
            console.error('[Auth Error] Coach bcrypt comparison error:', {
              email,
              error:
                bcryptError instanceof Error
                  ? bcryptError.message
                  : String(bcryptError),
              hashFormat: coach.password?.substring(0, 7),
            });
            // Continue to throw invalid credentials
          }
        }
      }

      // If no user found or password invalid
      console.log(
        '[Auth Debug] Login failed - no valid user or password mismatch:',
        {
          email,
          checkedAdmin: !!admin,
          checkedUser: !!user,
          checkedCoach: !!coach,
          adminActive: admin?.active_status,
          userActive: user?.active_status,
          coachActive: coach?.is_active,
          adminHasPassword: !!admin?.password,
          userHasPassword: !!user?.password,
          coachHasPassword: !!coach?.password,
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

      throw new UnauthorizedException({
        message: 'Invalid email or password',
        error: 'Unauthorized',
        statusCode: 401,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('Login error:', error);
      throw new UnauthorizedException({
        message: 'Invalid email or password',
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
          // Hash password before creating user
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const newUser = await this.usersService.create({
            ho_va_ten: name,
            email: email,
            password: hashedPassword,
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
        // Check if email exists in parents table
        const allParents = await this.parentsService.findAll();
        const existingParent = allParents.find((p) => p.email === email);
        if (existingParent) {
          throw new ConflictException('Email already exists');
        }

        // Create parent
        // Note: Parent entity doesn't have password field
        // Same limitation as User entity
        const newParent = await this.parentsService.create({
          name: name,
          email: email,
          phone: phone || undefined,
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
