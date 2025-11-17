import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { TestRegistration } from './entities/test-registration.entity';
import { TestExam } from './entities/test-exam.entity';
import { User } from '../users/entities/user.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { CreateTestRegistrationDto } from './dto/create-test-registration.dto';
import { UpdateTestRegistrationDto } from './dto/update-test-registration.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class TestRegistrationsService {
  constructor(
    @InjectRepository(TestRegistration)
    private readonly testRegistrationRepository: Repository<TestRegistration>,
    @InjectRepository(TestExam)
    private readonly testExamRepository: Repository<TestExam>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BeltLevel)
    private readonly beltLevelRepository: Repository<BeltLevel>,
  ) {}

  async create(
    input: CreateTestRegistrationDto,
  ): Promise<TestRegistration> {
    const entity: TestRegistration =
      this.testRegistrationRepository.create({
        ...input,
        registration_date: input.registration_date
          ? (new Date(input.registration_date) as any)
          : undefined,
      } as DeepPartial<TestRegistration>);
    return await this.testRegistrationRepository.save(entity);
  }

  async findAll(): Promise<TestRegistration[]> {
    return await this.testRegistrationRepository.find({
      relations: {
        test_exam: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TestRegistration> {
    const item = await this.testRegistrationRepository.findOne({
      where: { id },
      relations: {
        test_exam: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
    });
    if (!item)
      throw new NotFoundException(
        `TestRegistration with ID ${id} not found`,
      );
    return item;
  }

  async findByTest(test_id: number): Promise<TestRegistration[]> {
    return await this.testRegistrationRepository.find({
      where: { test_id },
      relations: {
        test_exam: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(user_id: number): Promise<TestRegistration[]> {
    return await this.testRegistrationRepository.find({
      where: { user_id },
      relations: {
        test_exam: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateTestRegistrationDto,
  ): Promise<TestRegistration> {
    const item = await this.findOne(id);
    Object.assign(item, {
      ...input,
      registration_date: input.registration_date
        ? (new Date(input.registration_date) as any)
        : item.registration_date,
    });
    return await this.testRegistrationRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.testRegistrationRepository.remove(item);
  }

  /**
   * Import test results from Excel file
   * Expected Excel format:
   * - Row 1: Headers (STT, Mã hội viên, Họ tên, Cấp đai hiện tại, Cấp đai mục tiêu, Điểm, Kết quả, Ghi chú)
   * - Row 2+: Data rows
   * Automatically creates test exam from filename if testId not provided
   */
  async importFromExcel(
    fileBuffer: Buffer,
    testId?: number,
    clubId?: number,
    fileName?: string,
  ): Promise<{
    success: boolean;
    message: string;
    imported: number;
    failed: number;
    errors: string[];
    testExamId?: number;
  }> {
    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      }) as any[];

      if (data.length < 2) {
        throw new BadRequestException(
          'Excel file must have at least header row and one data row',
        );
      }

      const headers = data[0] as string[];
      const rows = data.slice(1);

      // Find column indices
      const findColumnIndex = (keywords: string[]): number => {
        for (const keyword of keywords) {
          const index = headers.findIndex(
            (h) =>
              h &&
              h.toString().toLowerCase().includes(keyword.toLowerCase()),
          );
          if (index !== -1) return index;
        }
        return -1;
      };

      const maHoiVienIndex = findColumnIndex([
        'mã hội viên',
        'ma hoi vien',
        'mã',
        'code',
      ]);
      const hoTenIndex = findColumnIndex([
        'họ tên',
        'ho ten',
        'tên',
        'name',
      ]);
      const capDaiHienTaiIndex = findColumnIndex([
        'cấp đai hiện tại',
        'cap dai hien tai',
        'đai hiện tại',
        'current belt',
      ]);
      const capDaiMucTieuIndex = findColumnIndex([
        'cấp đai mục tiêu',
        'cap dai muc tieu',
        'đai mục tiêu',
        'target belt',
      ]);
      const diemIndex = findColumnIndex(['điểm', 'diem', 'score', 'điểm số']);
      const ketQuaIndex = findColumnIndex([
        'kết quả',
        'ket qua',
        'result',
        'kết quả thi',
      ]);
      const ghiChuIndex = findColumnIndex([
        'ghi chú',
        'ghi chu',
        'note',
        'notes',
        'chú thích',
      ]);

      if (maHoiVienIndex === -1 && hoTenIndex === -1) {
        throw new BadRequestException(
          'Excel file must have "Mã hội viên" or "Họ tên" column',
        );
      }

      // Get or create test exam
      let testExam: TestExam | null = null;
      if (testId) {
        testExam = await this.testExamRepository.findOne({
          where: { id: testId },
        });
        if (!testExam) {
          throw new NotFoundException(`Test exam with ID ${testId} not found`);
        }
      } else {
        // Auto-create test exam from filename
        let testName = 'Kỳ thi thăng cấp';
        if (fileName) {
          // Extract test name from filename
          // Example: "KẾT QUẢ THI Q3.2025.xlsx" -> "Kỳ thi Q3.2025"
          const nameWithoutExt = fileName
            .replace(/\.(xlsx|xls|xlsm)$/i, '')
            .trim();
          
          // Try to extract meaningful name
          if (nameWithoutExt.includes('THI') || nameWithoutExt.includes('KẾT QUẢ')) {
            // Extract quarter/year pattern like Q3.2025, Q1.2024, etc.
            const quarterMatch = nameWithoutExt.match(/(Q[1-4]\.?\d{4})/i);
            if (quarterMatch) {
              testName = `Kỳ thi ${quarterMatch[1]}`;
            } else {
              // Extract year
              const yearMatch = nameWithoutExt.match(/(\d{4})/);
              if (yearMatch) {
                testName = `Kỳ thi ${yearMatch[1]}`;
              } else {
                // Use cleaned filename
                testName = nameWithoutExt
                  .replace(/KẾT QUẢ THI/gi, 'Kỳ thi')
                  .replace(/THI/gi, 'Kỳ thi')
                  .trim();
              }
            }
          } else {
            testName = nameWithoutExt;
          }
        }

        // Check if test exam with same name already exists
        testExam = await this.testExamRepository.findOne({
          where: { test_name: testName },
        });

        if (!testExam) {
          // Create new test exam
          testExam = this.testExamRepository.create({
            test_name: testName,
            test_date: new Date(), // Use current date as default
            club_id: clubId || undefined,
            status: 'completed', // Assume completed if importing results
          });
          testExam = await this.testExamRepository.save(testExam);
        }
      }

      // Get all belt levels for mapping
      const beltLevels = await this.beltLevelRepository.find();
      const beltLevelMap = new Map<string, number>();
      beltLevels.forEach((belt) => {
        const nameLower = belt.name.toLowerCase().trim();
        // Add exact match
        beltLevelMap.set(nameLower, belt.id);
        
        // Add variations without "Đai" prefix
        if (nameLower.includes('đai')) {
          const withoutDai = nameLower.replace(/đai\s*/gi, '').trim();
          if (withoutDai) {
            beltLevelMap.set(withoutDai, belt.id);
          }
        }
        
        // Add variations with common patterns
        // Example: "Đai Trắng" -> "Trắng", "Trắng Đai"
        const parts = nameLower.split(/\s+/);
        if (parts.length > 1) {
          parts.forEach((part) => {
            if (part !== 'đai' && part.length > 0) {
              beltLevelMap.set(part, belt.id);
            }
          });
        }
        
        // Add number-only if belt name contains numbers
        const numberMatch = nameLower.match(/(\d+)/);
        if (numberMatch) {
          beltLevelMap.set(numberMatch[1], belt.id);
        }
      });

      const errors: string[] = [];
      let imported = 0;
      let failed = 0;

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        try {
          // Get student identifier
          const maHoiVien =
            maHoiVienIndex !== -1
              ? String(row[maHoiVienIndex] || '').trim()
              : '';
          const hoTen =
            hoTenIndex !== -1 ? String(row[hoTenIndex] || '').trim() : '';

          if (!maHoiVien && !hoTen) {
            errors.push(`Row ${i + 2}: Missing student identifier`);
            failed++;
            continue;
          }

          // Find user
          let user: User | null = null;
          if (maHoiVien) {
            user = await this.userRepository.findOne({
              where: { ma_hoi_vien: maHoiVien },
            });
          }
          if (!user && hoTen) {
            user = await this.userRepository.findOne({
              where: { ho_va_ten: hoTen },
            });
          }

          if (!user) {
            errors.push(
              `Row ${i + 2}: Student not found (${maHoiVien || hoTen})`,
            );
            failed++;
            continue;
          }

          // Get belt levels
          const capDaiHienTaiName =
            capDaiHienTaiIndex !== -1
              ? String(row[capDaiHienTaiIndex] || '').trim()
              : '';
          const capDaiMucTieuName =
            capDaiMucTieuIndex !== -1
              ? String(row[capDaiMucTieuIndex] || '').trim()
              : '';

          let currentBeltId = user.cap_dai_id;
          let targetBeltId: number | null = null;

          // Helper function to find belt ID
          const findBeltId = (beltName: string): number | null => {
            if (!beltName) return null;
            const nameLower = beltName.toLowerCase().trim();
            
            // Try exact match first
            let found = beltLevelMap.get(nameLower);
            if (found) return found;
            
            // Try without "Đai" prefix
            const withoutDai = nameLower.replace(/đai\s*/gi, '').trim();
            if (withoutDai) {
              found = beltLevelMap.get(withoutDai);
              if (found) return found;
            }
            
            // Try partial match
            for (const [key, value] of beltLevelMap.entries()) {
              if (nameLower.includes(key) || key.includes(nameLower)) {
                return value;
              }
            }
            
            return null;
          };

          if (capDaiHienTaiName) {
            const foundBeltId = findBeltId(capDaiHienTaiName);
            if (foundBeltId) {
              currentBeltId = foundBeltId;
            }
          }

          if (capDaiMucTieuName) {
            const foundBeltId = findBeltId(capDaiMucTieuName);
            if (foundBeltId) {
              targetBeltId = foundBeltId;
            } else {
              errors.push(
                `Row ${i + 2}: Target belt level not found (${capDaiMucTieuName})`,
              );
            }
          }

          if (!targetBeltId) {
            errors.push(`Row ${i + 2}: Missing target belt level`);
            failed++;
            continue;
          }

          // Get score and result
          const scoreStr =
            diemIndex !== -1 ? String(row[diemIndex] || '').trim() : '';
          const score = scoreStr ? parseFloat(scoreStr) : null;

          const ketQuaStr =
            ketQuaIndex !== -1
              ? String(row[ketQuaIndex] || '').trim().toLowerCase()
              : '';
          let testResult: 'pass' | 'fail' | 'pending' = 'pending';
          if (ketQuaStr.includes('đạt') || ketQuaStr.includes('pass')) {
            testResult = 'pass';
          } else if (ketQuaStr.includes('không') || ketQuaStr.includes('fail')) {
            testResult = 'fail';
          }

          const ghiChu =
            ghiChuIndex !== -1 ? String(row[ghiChuIndex] || '').trim() : '';

          // Create or update test registration
          const testExamId = testExam?.id || testId;
          const whereCondition: any = {
            user_id: user.id,
          };
          if (testExamId) {
            whereCondition.test_id = testExamId;
          }
          
          const existingRegistration =
            await this.testRegistrationRepository.findOne({
              where: whereCondition,
            });

          if (existingRegistration) {
            // Update existing
            existingRegistration.current_belt_id = currentBeltId;
            existingRegistration.target_belt_id = targetBeltId;
            if (score !== null && score !== undefined) {
              existingRegistration.score = score;
            }
            existingRegistration.test_result = testResult;
            if (ghiChu) {
              existingRegistration.examiner_notes = ghiChu;
            }
            await this.testRegistrationRepository.save(existingRegistration);
          } else {
            // Create new
            const newRegistration = this.testRegistrationRepository.create({
              test_id: testExamId || undefined,
              user_id: user.id,
              current_belt_id: currentBeltId,
              target_belt_id: targetBeltId,
              score: score !== null && score !== undefined ? score : undefined,
              test_result: testResult,
              examiner_notes: ghiChu || undefined,
              payment_status: 'paid', // Assume paid if importing results
            });
            await this.testRegistrationRepository.save(newRegistration);
          }

          imported++;
        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message || 'Unknown error'}`);
          failed++;
        }
      }

      return {
        success: true,
        message: `Imported ${imported} records, ${failed} failed`,
        imported,
        failed,
        errors: errors.slice(0, 50), // Limit errors to first 50
        testExamId: testExam?.id,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to import Excel: ${error.message}`,
      );
    }
  }
}

