import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KetQuaThi } from './entities/ket-qua-thi.entity';
import { User } from '../users/entities/user.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { TestExam } from '../test-registrations/entities/test-exam.entity';
import { CreateKetQuaThiDto, UpdateKetQuaThiDto } from './dto';
import * as XLSX from 'xlsx';

@Injectable()
export class KetQuaThiService {
  private readonly logger = new Logger(KetQuaThiService.name);

  constructor(
    @InjectRepository(KetQuaThi)
    private readonly ketQuaThiRepository: Repository<KetQuaThi>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BeltLevel)
    private readonly beltLevelRepository: Repository<BeltLevel>,
    @InjectRepository(TestExam)
    private readonly testExamRepository: Repository<TestExam>,
  ) {}

  async create(createKetQuaThiDto: CreateKetQuaThiDto): Promise<KetQuaThi> {
    const ketQuaThi = this.ketQuaThiRepository.create(createKetQuaThiDto);
    return await this.ketQuaThiRepository.save(ketQuaThi);
  }

  async findAll(
    page: number = 1,
    limit: number = 25,
  ): Promise<{
    docs: KetQuaThi[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
  }> {
    // Get total count
    const totalDocs = await this.ketQuaThiRepository.count();

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalDocs / limit);

    const docs = await this.ketQuaThiRepository.find({
      skip,
      take: limit,
      relations: ['test_exam', 'user', 'cap_dai_du_thi'],
      order: { created_at: 'DESC' },
    });

    return {
      docs,
      totalDocs,
      limit,
      page,
      totalPages,
    };
  }

  async findOne(id: number): Promise<KetQuaThi> {
    const ketQuaThi = await this.ketQuaThiRepository.findOne({
      where: { id },
      relations: ['test_exam', 'user', 'cap_dai_du_thi'],
    });

    if (!ketQuaThi) {
      throw new NotFoundException(`Ket qua thi with ID ${id} not found`);
    }

    return ketQuaThi;
  }

  async findByTest(testId: number): Promise<KetQuaThi[]> {
    return await this.ketQuaThiRepository.find({
      where: { test_id: testId },
      relations: ['test_exam', 'user', 'cap_dai_du_thi'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<KetQuaThi[]> {
    return await this.ketQuaThiRepository.find({
      where: { user_id: userId },
      relations: ['test_exam', 'user', 'cap_dai_du_thi'],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    updateKetQuaThiDto: UpdateKetQuaThiDto,
  ): Promise<KetQuaThi> {
    const ketQuaThi = await this.findOne(id);
    Object.assign(ketQuaThi, updateKetQuaThiDto);
    return await this.ketQuaThiRepository.save(ketQuaThi);
  }

  async remove(id: number): Promise<void> {
    const ketQuaThi = await this.findOne(id);
    await this.ketQuaThiRepository.remove(ketQuaThi);
  }

  /**
   * Import test results from Excel file
   * Expected Excel format based on image:
   * - Row 1: Headers (KỲ THI, MÃ CLB, MÃ HỘI VIÊN, CẤP ĐẠI DỰ THI, SỐ THI, HỌ VÀ TÊN, GIỚI TÍNH, NTNS,
   *          KỸ THUẬT TẤN CĂN BẢN, NGUYÊN TẮC PHÁT LỰC, CĂN BẢN TAY, KỸ THUẬT CHÂN, CĂN BẢN TỰ VỆ,
   *          BÀI QUYỀN, PHÂN THẾ BÀI QUYỀN, SONG ĐẤU, THỂ LỰC, KẾT QUẢ, GHI CHÚ)
   * - Row 2+: Data rows
   */
  async importFromExcel(
    fileBuffer: Buffer,
    testId?: number,
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
        raw: false,
        blankrows: false,
      }) as any[];

      if (data.length < 2) {
        throw new BadRequestException(
          'Excel file must have at least header row and one data row',
        );
      }

      const headers = data[0] as string[];
      const rows = data.slice(1);

      // Normalize headers
      const normalizedHeaders = headers.map((h) =>
        h ? h.toString().trim().replace(/\s+/g, ' ').toLowerCase() : '',
      );

      this.logger.log('Excel headers found: ' + JSON.stringify(headers));

      // Find column indices
      const findColumnIndex = (keywords: string[]): number => {
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase().trim();
          const exactIndex = normalizedHeaders.findIndex(
            (h) => h === normalizedKeyword,
          );
          if (exactIndex !== -1) return exactIndex;

          const containsIndex = normalizedHeaders.findIndex((h) =>
            h.includes(normalizedKeyword),
          );
          if (containsIndex !== -1) return containsIndex;
        }
        return -1;
      };

      const kyThiIndex = findColumnIndex([
        'kỳ thi',
        'ky thi',
        'test',
        'examination',
      ]);
      const maClbIndex = findColumnIndex([
        'mã clb',
        'ma clb',
        'mã câu lạc bộ',
        'ma cau lac bo',
        'club',
        'club code',
      ]);
      const maHoiVienIndex = findColumnIndex([
        'mã hội viên',
        'ma hoi vien',
        'mã hv',
        'ma hv',
        'mã',
        'ma',
        'code',
        'member code',
      ]);
      const capDaiDuThiIndex = findColumnIndex([
        'cấp đai dự thi',
        'cap dai du thi',
        'cấp đai',
        'cap dai',
        'belt level',
        'belt level id',
      ]);
      const soThiIndex = findColumnIndex([
        'số thi',
        'so thi',
        'test number',
        'examination number',
      ]);
      const hoTenIndex = findColumnIndex([
        'họ và tên',
        'ho va ten',
        'họ tên',
        'ho ten',
        'tên',
        'ten',
        'name',
      ]);
      const gioiTinhIndex = findColumnIndex([
        'giới tính',
        'gioi tinh',
        'gender',
        'sex',
      ]);
      const ngaySinhIndex = findColumnIndex([
        'ntns',
        'ngày sinh',
        'ngay sinh',
        'ngày tháng năm sinh',
        'ngay thang nam sinh',
        'date of birth',
        'dob',
      ]);
      const kyThuatTanCanBanIndex = findColumnIndex([
        'kỹ thuật tấn căn bản',
        'ky thuat tan can ban',
        'kỹ thuật tấn',
        'ky thuat tan',
      ]);
      const nguyenTacPhatLucIndex = findColumnIndex([
        'nguyên tắc phát lực',
        'nguyen tac phat luc',
        'phát lực',
        'phat luc',
      ]);
      const canBanTayIndex = findColumnIndex([
        'căn bản tay',
        'can ban tay',
        'tay',
      ]);
      const kyThuatChanIndex = findColumnIndex([
        'kỹ thuật chân',
        'ky thuat chan',
        'chân',
        'chan',
      ]);
      const canBanTuVeIndex = findColumnIndex([
        'căn bản tự vệ',
        'can ban tu ve',
        'tự vệ',
        'tu ve',
      ]);
      const baiQuyenIndex = findColumnIndex([
        'bài quyền',
        'bai quyen',
        'quyền',
        'quyen',
        'poomsae',
      ]);
      const phanTheBaiQuyenIndex = findColumnIndex([
        'phân thế bài quyền',
        'phan the bai quyen',
        'phân thế',
        'phan the',
      ]);
      const songDauIndex = findColumnIndex([
        'song đấu',
        'song dau',
        'đấu',
        'dau',
        'sparring',
      ]);
      const theLucIndex = findColumnIndex([
        'thể lực',
        'the luc',
        'fitness',
        'stamina',
      ]);
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

      // Helper function to safely extract cell value
      const getCellValue = (row: any[], index: number): string => {
        if (index === -1 || index >= row.length) return '';
        const cell = row[index];
        if (cell === null || cell === undefined) return '';
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

      const imported: number[] = [];
      const errors: string[] = [];

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
          // Skip empty rows
          const hasData = row.some(
            (cell: any) => cell !== null && cell !== undefined && cell !== '',
          );
          if (!hasData) {
            continue;
          }

          // Extract data from row
          const maHoiVien = getCellValue(row, maHoiVienIndex);
          const maClb = getCellValue(row, maClbIndex);
          const hoTen = getCellValue(row, hoTenIndex);
          const capDaiDuThiStr = getCellValue(row, capDaiDuThiIndex);
          const soThi = getCellValue(row, soThiIndex);
          const gioiTinh = getCellValue(row, gioiTinhIndex);
          const ngaySinh = getCellValue(row, ngaySinhIndex);
          const kyThuatTanCanBan = getCellValue(row, kyThuatTanCanBanIndex);
          const nguyenTacPhatLuc = getCellValue(row, nguyenTacPhatLucIndex);
          const canBanTay = getCellValue(row, canBanTayIndex);
          const kyThuatChan = getCellValue(row, kyThuatChanIndex);
          const canBanTuVe = getCellValue(row, canBanTuVeIndex);
          const baiQuyen = getCellValue(row, baiQuyenIndex);
          const phanTheBaiQuyen = getCellValue(row, phanTheBaiQuyenIndex);
          const songDau = getCellValue(row, songDauIndex);
          const theLuc = getCellValue(row, theLucIndex);
          const ketQuaStr = getCellValue(row, ketQuaIndex);
          const ghiChu = getCellValue(row, ghiChuIndex);

          // Validate required fields
          if (!maHoiVien && !hoTen) {
            errors.push(
              `Dòng ${rowNumber}: Thiếu "Mã hội viên" hoặc "Họ và tên"`,
            );
            continue;
          }

          // Find user by ma_hoi_vien or ho_va_ten
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

          // Find belt level by name or ID
          let capDaiDuThiId: number | undefined;
          if (capDaiDuThiStr) {
            // Try to parse as number first
            const capDaiNumber = parseInt(capDaiDuThiStr);
            if (!isNaN(capDaiNumber)) {
              capDaiDuThiId = capDaiNumber;
            } else {
              // Try to find by name
              const beltLevel = await this.beltLevelRepository.findOne({
                where: { name: capDaiDuThiStr },
              });
              if (beltLevel) {
                capDaiDuThiId = beltLevel.id;
              }
            }
          }

          // Parse date
          let parsedDate: Date | undefined;
          if (ngaySinh) {
            const dateStr = ngaySinh.toString();
            if (!isNaN(Number(dateStr))) {
              const excelEpoch = new Date(1899, 11, 30);
              const days = Number(dateStr);
              parsedDate = new Date(
                excelEpoch.getTime() + days * 24 * 60 * 60 * 1000,
              );
            } else {
              parsedDate = new Date(dateStr);
              if (isNaN(parsedDate.getTime())) {
                const parts = dateStr.split(/[\/\-]/);
                if (parts.length === 3) {
                  parsedDate = new Date(
                    parseInt(parts[2]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[0]),
                  );
                }
              }
            }
            if (isNaN(parsedDate.getTime())) {
              parsedDate = undefined;
            }
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

          // Normalize ket qua
          let normalizedKetQua: 'Đạt' | 'Không đạt' | 'Chưa có kết quả' =
            'Chưa có kết quả';
          if (ketQuaStr) {
            const ketQuaLower = ketQuaStr.toLowerCase();
            if (
              ketQuaLower.includes('đạt') ||
              ketQuaLower.includes('dat') ||
              ketQuaLower.includes('pass')
            ) {
              normalizedKetQua = 'Đạt';
            } else if (
              ketQuaLower.includes('không') ||
              ketQuaLower.includes('khong') ||
              ketQuaLower.includes('fail')
            ) {
              normalizedKetQua = 'Không đạt';
            }
          }

          // Parse scores
          const parseScore = (value: string): number | undefined => {
            if (!value || value.trim() === '') return undefined;
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num;
          };

          // Create ket qua thi
          const ketQuaThiData: CreateKetQuaThiDto = {
            test_id: testId,
            ma_clb: maClb || undefined,
            user_id: user?.id,
            ma_hoi_vien: maHoiVien || undefined,
            cap_dai_du_thi_id: capDaiDuThiId,
            so_thi: soThi || undefined,
            ho_va_ten: hoTen || user?.ho_va_ten || undefined,
            gioi_tinh: normalizedGender,
            ngay_thang_nam_sinh: parsedDate
              ? parsedDate.toISOString().split('T')[0]
              : undefined,
            ky_thuat_tan_can_ban: parseScore(kyThuatTanCanBan),
            nguyen_tac_phat_luc: parseScore(nguyenTacPhatLuc),
            can_ban_tay: parseScore(canBanTay),
            ky_thuat_chan: parseScore(kyThuatChan),
            can_ban_tu_ve: parseScore(canBanTuVe),
            bai_quyen: parseScore(baiQuyen),
            phan_the_bai_quyen: parseScore(phanTheBaiQuyen),
            song_dau: parseScore(songDau),
            the_luc: parseScore(theLuc),
            ket_qua: normalizedKetQua,
            ghi_chu: ghiChu || undefined,
          };

          const ketQuaThi = await this.create(ketQuaThiData);
          imported.push(ketQuaThi.id);
        } catch (error: any) {
          const errorMessage = error?.message || 'Unknown error';
          errors.push(`Dòng ${rowNumber}: ${errorMessage}`);
        }
      }

      return {
        success: imported.length > 0,
        message: `Đã import ${imported.length} kết quả thi thành công, ${errors.length} lỗi`,
        imported: imported.length,
        failed: errors.length,
        errors,
      };
    } catch (error: any) {
      this.logger.error('Error importing ket qua thi from Excel:', error);
      throw new BadRequestException(
        error?.message || 'Error importing test results from Excel file',
      );
    }
  }
}
