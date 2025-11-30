/**
 * Script để import kết quả thi từ file Excel vào database
 * Chạy: npm run import-test-results -- <path-to-excel-file> [--test-id=<id>] [--club-id=<id>]
 * Ví dụ: npm run import-test-results -- "KẾT QUẢ THI Q3.2025..xlsx"
 */

import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { TestRegistration } from '../src/test-registrations/entities/test-registration.entity';
import { TestExam } from '../src/test-registrations/entities/test-exam.entity';
import { User } from '../src/users/entities/user.entity';
import { BeltLevel } from '../src/belt-levels/entities/belt-level.entity';
import { Coach } from '../src/coaches/entities/coach.entity';
import { Club } from '../src/clubs/entities/club.entity';
import * as XLSX from 'xlsx';

dotenv.config({ path: '.env' });

async function importTestResults() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith('--'));
  const testIdArg = args.find((arg) => arg.startsWith('--test-id='));
  const clubIdArg = args.find((arg) => arg.startsWith('--club-id='));

  const testId = testIdArg ? parseInt(testIdArg.split('=')[1]) : undefined;
  const clubId = clubIdArg ? parseInt(clubIdArg.split('=')[1]) : undefined;

  if (!filePath) {
    console.error('Vui long cung cap duong dan den file Excel');
    console.log(
      'Cach su dung: npm run import-test-results -- <path-to-excel-file> [--test-id=<id>] [--club-id=<id>]',
    );
    process.exit(1);
  }

  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`File khong ton tai: ${fullPath}`);
    process.exit(1);
  }

  console.log('Dang doc file Excel...');
  console.log(`   File: ${fullPath}`);

  // Read Excel file
  const fileBuffer = fs.readFileSync(fullPath);
  const fileName = path.basename(fullPath);

  // Initialize database connection
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '8889'),
    username: process.env.DB_USERNAME || 'taekwondo_user',
    password: process.env.DB_PASSWORD || 'taekwondo_pass123',
    database: process.env.DB_DATABASE || 'taekwondo_club',
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Ket noi database thanh cong!');

    const testRegistrationRepo = dataSource.getRepository(TestRegistration);
    const testExamRepo = dataSource.getRepository(TestExam);
    const userRepo = dataSource.getRepository(User);
    const beltLevelRepo = dataSource.getRepository(BeltLevel);

    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
    }) as any[];

    if (data.length < 2) {
      throw new Error(
        'Excel file must have at least header row and one data row',
      );
    }

    const headers = data[0] as string[];
    const rows = data.slice(1);

    console.log(`\nTim thay ${rows.length} dong du lieu`);

    // Find column indices
    const findColumnIndex = (keywords: string[]): number => {
      for (const keyword of keywords) {
        const index = headers.findIndex(
          (h) =>
            h && h.toString().toLowerCase().includes(keyword.toLowerCase()),
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
    const hoTenIndex = findColumnIndex(['họ tên', 'ho ten', 'tên', 'name']);
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

    console.log('\nCac cot duoc tim thay:');
    console.log(
      `   - Ma hoi vien: ${maHoiVienIndex !== -1 ? `Cot ${maHoiVienIndex + 1}` : 'Khong tim thay'}`,
    );
    console.log(
      `   - Ho ten: ${hoTenIndex !== -1 ? `Cot ${hoTenIndex + 1}` : 'Khong tim thay'}`,
    );
    console.log(
      `   - Cap dai hien tai: ${capDaiHienTaiIndex !== -1 ? `Cot ${capDaiHienTaiIndex + 1}` : 'Khong tim thay'}`,
    );
    console.log(
      `   - Cap dai muc tieu: ${capDaiMucTieuIndex !== -1 ? `Cot ${capDaiMucTieuIndex + 1}` : 'Khong tim thay'}`,
    );
    console.log(
      `   - Diem: ${diemIndex !== -1 ? `Cot ${diemIndex + 1}` : 'Khong tim thay'}`,
    );
    console.log(
      `   - Ket qua: ${ketQuaIndex !== -1 ? `Cot ${ketQuaIndex + 1}` : 'Khong tim thay'}`,
    );
    console.log(
      `   - Ghi chu: ${ghiChuIndex !== -1 ? `Cot ${ghiChuIndex + 1}` : 'Khong tim thay'}`,
    );

    if (maHoiVienIndex === -1 && hoTenIndex === -1) {
      throw new Error('Excel file must have "Mã hội viên" or "Họ tên" column');
    }

    // Get or create test exam
    let testExam: TestExam | null = null;
    if (testId) {
      testExam = await testExamRepo.findOne({
        where: { id: testId },
      });
      if (!testExam) {
        throw new Error(`Test exam with ID ${testId} not found`);
      }
      console.log(
        `\nSu dung ky thi: ${testExam.test_name} (ID: ${testExam.id})`,
      );
    } else {
      // Auto-create test exam from filename
      let testName = 'Kỳ thi thăng cấp';
      if (fileName) {
        const nameWithoutExt = fileName
          .replace(/\.(xlsx|xls|xlsm)$/i, '')
          .trim();

        if (
          nameWithoutExt.includes('THI') ||
          nameWithoutExt.includes('KẾT QUẢ')
        ) {
          const quarterMatch = nameWithoutExt.match(/(Q[1-4]\.?\d{4})/i);
          if (quarterMatch) {
            testName = `Kỳ thi ${quarterMatch[1]}`;
          } else {
            const yearMatch = nameWithoutExt.match(/(\d{4})/);
            if (yearMatch) {
              testName = `Kỳ thi ${yearMatch[1]}`;
            } else {
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

      testExam = await testExamRepo.findOne({
        where: { test_name: testName },
      });

      if (!testExam) {
        const newTestExam = testExamRepo.create({
          test_name: testName,
          test_date: new Date(),
          club_id: clubId || undefined,
          status: 'completed',
        } as any);
        const saved = await testExamRepo.save(newTestExam);
        testExam = Array.isArray(saved) ? saved[0] : saved;
        console.log(
          `\nDa tao ky thi moi: ${testExam.test_name} (ID: ${testExam.id})`,
        );
      } else {
        console.log(
          `\nSu dung ky thi hien co: ${testExam.test_name} (ID: ${testExam.id})`,
        );
      }
    }

    if (!testExam) {
      throw new Error('Failed to create or find test exam');
    }

    // Get all belt levels for mapping
    const beltLevels = await beltLevelRepo.find();
    const beltLevelMap = new Map<string, number>();
    beltLevels.forEach((belt) => {
      const nameLower = belt.name.toLowerCase().trim();
      beltLevelMap.set(nameLower, belt.id);

      if (nameLower.includes('đai')) {
        const withoutDai = nameLower.replace(/đai\s*/gi, '').trim();
        if (withoutDai) {
          beltLevelMap.set(withoutDai, belt.id);
        }
      }

      const parts = nameLower.split(/\s+/);
      if (parts.length > 1) {
        parts.forEach((part) => {
          if (part !== 'đai' && part.length > 0) {
            beltLevelMap.set(part, belt.id);
          }
        });
      }

      const numberMatch = nameLower.match(/(\d+)/);
      if (numberMatch) {
        beltLevelMap.set(numberMatch[1], belt.id);
      }
    });

    console.log(`\nDa load ${beltLevels.length} cap dai tu database`);

    const errors: string[] = [];
    let imported = 0;
    let failed = 0;

    console.log('\nBat dau import du lieu...\n');

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      try {
        // Get student identifier
        const maHoiVien =
          maHoiVienIndex !== -1 ? String(row[maHoiVienIndex] || '').trim() : '';
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
          user = await userRepo.findOne({
            where: { ma_hoi_vien: maHoiVien },
            select: ['id', 'ho_va_ten', 'ma_hoi_vien', 'cap_dai_id'],
          });
        }
        if (!user && hoTen) {
          user = await userRepo.findOne({
            where: { ho_va_ten: hoTen },
            select: ['id', 'ho_va_ten', 'ma_hoi_vien', 'cap_dai_id'],
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

          let found = beltLevelMap.get(nameLower);
          if (found) return found;

          const withoutDai = nameLower.replace(/đai\s*/gi, '').trim();
          if (withoutDai) {
            found = beltLevelMap.get(withoutDai);
            if (found) return found;
          }

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
            ? String(row[ketQuaIndex] || '')
                .trim()
                .toLowerCase()
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
        const existingRegistration = await testRegistrationRepo.findOne({
          where: {
            user_id: user.id,
            test_id: testExam.id,
          },
        });

        if (existingRegistration) {
          existingRegistration.current_belt_id = currentBeltId;
          existingRegistration.target_belt_id = targetBeltId;
          (existingRegistration as any).score = score ?? null;
          existingRegistration.test_result = testResult;
          (existingRegistration as any).examiner_notes = ghiChu || null;
          await testRegistrationRepo.save(existingRegistration);
          console.log(
            `   Row ${i + 2}: Cap nhat ${user.ho_va_ten} (${maHoiVien || hoTen})`,
          );
        } else {
          const newRegistration = testRegistrationRepo.create({
            test_id: testExam.id,
            user_id: user.id,
            current_belt_id: currentBeltId,
            target_belt_id: targetBeltId,
            score: score ?? null,
            test_result: testResult,
            examiner_notes: ghiChu || null,
            payment_status: 'paid',
          } as any);
          await testRegistrationRepo.save(newRegistration);
          console.log(
            `   Row ${i + 2}: Import ${user.ho_va_ten} (${maHoiVien || hoTen})`,
          );
        }

        imported++;
      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message || 'Unknown error'}`);
        failed++;
        console.log(`   Row ${i + 2}: ${error.message || 'Unknown error'}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('KET QUA IMPORT:');
    console.log(`   Thanh cong: ${imported} ban ghi`);
    console.log(`   That bai: ${failed} ban ghi`);
    console.log(`   Ky thi: ${testExam.test_name} (ID: ${testExam.id})`);

    if (errors.length > 0) {
      console.log('\nCAC LOI:');
      errors.slice(0, 20).forEach((error) => {
        console.log(`   - ${error}`);
      });
      if (errors.length > 20) {
        console.log(`   ... và ${errors.length - 20} lỗi khác`);
      }
    }

    await dataSource.destroy();
    console.log('\nHoan tat!');
  } catch (error: any) {
    console.error('\nLoi:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importTestResults();
