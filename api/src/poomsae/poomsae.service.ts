import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poomsae } from './poomsae.entity';
import { BeltLevelPoomsae } from './belt-level-poomsae.entity';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { CreatePoomsaeDto } from './dto/create-poomsae.dto';
import { UpdatePoomsaeDto } from './dto/update-poomsae.dto';

@Injectable()
export class PoomsaeService {
  constructor(
    @InjectRepository(Poomsae)
    private poomsaeRepository: Repository<Poomsae>,
    @InjectRepository(BeltLevelPoomsae)
    private beltLevelPoomsaeRepository: Repository<BeltLevelPoomsae>,
    @InjectRepository(BeltLevel)
    private beltLevelRepository: Repository<BeltLevel>,
  ) {}

  async create(createPoomsaeDto: CreatePoomsaeDto): Promise<Poomsae> {
    const poomsae = this.poomsaeRepository.create(createPoomsaeDto);
    return await this.poomsaeRepository.save(poomsae);
  }

  async findAll(): Promise<Poomsae[]> {
    return await this.poomsaeRepository.find({
      order: { tenBaiQuyenVietnamese: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Poomsae | null> {
    return await this.poomsaeRepository.findOne({
      where: { id },
      relations: ['beltLevelPoomsaes', 'beltLevelPoomsaes.beltLevel'],
    });
  }

  async update(
    id: number,
    updatePoomsaeDto: UpdatePoomsaeDto,
  ): Promise<Poomsae | null> {
    await this.poomsaeRepository.update(id, updatePoomsaeDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.poomsaeRepository.delete(id);
  }

  async findByBeltLevel(beltLevelId: number): Promise<Poomsae[]> {
    try {
      const beltLevelPoomsaes = await this.beltLevelPoomsaeRepository.find({
        where: { capDaiId: beltLevelId },
        relations: ['poomsae'],
        order: { thuTuUuTien: 'ASC' },
      });

      console.log(
        `[PoomsaeService] Found ${beltLevelPoomsaes.length} belt level poomsae relation(s) for belt level ${beltLevelId}`,
      );

      // Filter out null/undefined poomsae and log for debugging
      const poomsaes = beltLevelPoomsaes
        .map((bp) => {
          if (!bp || !bp.poomsae) {
            console.warn(`[PoomsaeService] Null poomsae in relation id ${bp?.id}`);
            return null;
          }
          return bp.poomsae;
        })
        .filter((poomsae) => poomsae !== null && poomsae !== undefined) as Poomsae[];

      console.log(
        `[PoomsaeService] Found ${poomsaes.length} valid poomsae(s) for belt level ${beltLevelId}`,
      );
      if (poomsaes.length === 0 && beltLevelPoomsaes.length > 0) {
        console.warn(
          `[PoomsaeService] Warning: Found ${beltLevelPoomsaes.length} belt level poomsae relations but poomsae entities are null/undefined`,
        );
      }

      return poomsaes;
    } catch (error) {
      console.error(`[PoomsaeService] Error finding poomsae for belt level ${beltLevelId}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getRequiredPoomsaeForBeltLevel(
    beltLevelId: number,
  ): Promise<Poomsae[]> {
    const beltLevelPoomsaes = await this.beltLevelPoomsaeRepository.find({
      where: {
        capDaiId: beltLevelId,
        loaiQuyen: 'bat_buoc',
      },
      relations: ['poomsae'],
      order: { thuTuUuTien: 'ASC' },
    });

    // Filter out null/undefined poomsae
    const poomsaes = beltLevelPoomsaes
      .map((bp) => bp.poomsae)
      .filter((poomsae) => poomsae !== null && poomsae !== undefined);

    console.log(
      `[PoomsaeService] Found ${poomsaes.length} required poomsae(s) for belt level ${beltLevelId}`,
    );

    return poomsaes;
  }

  async linkBeltLevelToPoomsae(
    beltLevelId: number,
    poomsaeId: number,
    loaiQuyen: 'bat_buoc' | 'tu_chon' | 'bo_sung' = 'bat_buoc',
    thuTuUuTien: number = 1,
  ): Promise<BeltLevelPoomsae> {
    const beltLevelPoomsae = this.beltLevelPoomsaeRepository.create({
      capDaiId: beltLevelId,
      baiQuyenId: poomsaeId,
      loaiQuyen,
      thuTuUuTien,
    });

    return await this.beltLevelPoomsaeRepository.save(beltLevelPoomsae);
  }

  async unlinkBeltLevelFromPoomsae(
    beltLevelId: number,
    poomsaeId: number,
  ): Promise<void> {
    await this.beltLevelPoomsaeRepository.delete({
      capDaiId: beltLevelId,
      baiQuyenId: poomsaeId,
    });
  }

  /**
   * Auto-link poomsae to belt levels based on standard Taekwondo mapping
   * Maps poomsae to belt levels by matching Korean name patterns
   */
  async autoLinkPoomsaeToBeltLevels(): Promise<{
    success: boolean;
    message: string;
    linked: number;
  }> {
    try {
      // Get all belt levels and poomsae
      const beltLevels = await this.beltLevelRepository.find({
        order: { order_sequence: 'ASC' },
      });
      const allPoomsaes = await this.poomsaeRepository.find();

      console.log(
        `[PoomsaeService] Auto-linking: Found ${beltLevels.length} belt levels and ${allPoomsaes.length} poomsaes`,
      );

      // Mapping pattern: Korean name to belt level order
      // Cấp 9 và Cấp 10 dùng bài quyền "Kĩ thuật", không phải Taegeuk
      const poomsaePatternMap: Record<string, string[]> = {
        // Kĩ thuật cho Cấp 9 và Cấp 10
        '기술': ['Cấp 9', 'Cấp 10'], // Kĩ thuật
        '기술 1': ['Cấp 10'], // Kĩ thuật 1
        '기술 2': ['Cấp 9'], // Kĩ thuật 2
        // Taegeuk cho Cấp 8 đến Cấp 1
        '태극 1장': ['Cấp 8'],
        '태극 2장': ['Cấp 7'],
        '태극 3장': ['Cấp 6'],
        '태극 4장': ['Cấp 5'],
        '태극 5장': ['Cấp 4'],
        '태극 6장': ['Cấp 3'],
        '태극 7장': ['Cấp 2'],
        '태극 8장': ['Cấp 1'],
        // Dan levels
        고려: ['Nhất đẳng (1 Dan)'],
        금강: ['Nhị đẳng (2 Dan)'],
        태백: ['Tam đẳng (3 Dan)'],
        평원: ['Tứ đẳng (4 Dan)'],
        십진: ['Ngũ đẳng (5 Dan)'],
        지태: ['Lục đẳng (6 Dan)'],
        천권: ['Thất đẳng (7 Dan)'],
        한수: ['Bát đẳng (8 Dan)'],
        일여: ['Cửu đẳng (9 Dan)', 'Thập đẳng (10 Dan)'],
      };

      // Alternative mapping by English name and Vietnamese name
      const poomsaeEnglishMap: Record<string, string[]> = {
        // Kĩ thuật cho Cấp 9 và Cấp 10
        'Kĩ thuật': ['Cấp 9', 'Cấp 10'],
        'Kĩ Thuật': ['Cấp 9', 'Cấp 10'],
        'kĩ Thuật': ['Cấp 9', 'Cấp 10'],
        'Kĩ thuật 1': ['Cấp 10'],
        'Kĩ thuật 1 Jang': ['Cấp 10'],
        'kĩ Thuật 1 Jang': ['Cấp 10'],
        'Kĩ thuật 2': ['Cấp 9'],
        'KT1': ['Cấp 10'],
        'KT2': ['Cấp 9'],
        // Taegeuk cho Cấp 8 đến Cấp 1
        'Taegeuk Il-jang': ['Cấp 8'],
        'Taegeuk Ee-jang': ['Cấp 7'],
        'Taegeuk Sam-jang': ['Cấp 6'],
        'Taegeuk Sa-jang': ['Cấp 5'],
        'Taegeuk O-jang': ['Cấp 4'],
        'Taegeuk Yuk-jang': ['Cấp 3'],
        'Taegeuk Chil-jang': ['Cấp 2'],
        'Taegeuk Pal-jang': ['Cấp 1'],
        // Dan levels
        Koryo: ['Nhất đẳng (1 Dan)'],
        Keumgang: ['Nhị đẳng (2 Dan)'],
        Taebaek: ['Tam đẳng (3 Dan)'],
        Pyongwon: ['Tứ đẳng (4 Dan)'],
        Sipjin: ['Ngũ đẳng (5 Dan)'],
        Jitae: ['Lục đẳng (6 Dan)'],
        Cheonkwon: ['Thất đẳng (7 Dan)'],
        Hansoo: ['Bát đẳng (8 Dan)'],
        Ilyeo: ['Cửu đẳng (9 Dan)', 'Thập đẳng (10 Dan)'],
      };

      let linkedCount = 0;
      const linkedPairs: Array<{ beltLevelId: number; poomsaeId: number }> = [];

      // Process each poomsae
      for (const poomsae of allPoomsaes) {
        const koreanName =
          poomsae.tenBaiQuyenKorean?.trim() || '';
        const englishName =
          poomsae.tenBaiQuyenEnglish?.trim() || '';
        const vietnameseName =
          poomsae.tenBaiQuyenVietnamese?.trim() || '';

        // Find matching belt level names
        let matchingBeltNames: string[] = [];

        // Try Vietnamese name first (most reliable for Kĩ thuật)
        if (vietnameseName) {
          const vietnameseLower = vietnameseName.toLowerCase();
          // Check for Kĩ thuật patterns
          if (
            vietnameseLower.includes('kĩ thuật') ||
            vietnameseLower.includes('kỹ thuật') ||
            vietnameseLower.includes('kỹ thuat')
          ) {
            if (
              vietnameseLower.includes('1') ||
              vietnameseLower.includes('kt1')
            ) {
              matchingBeltNames = ['Cấp 10'];
            } else if (
              vietnameseLower.includes('2') ||
              vietnameseLower.includes('kt2')
            ) {
              matchingBeltNames = ['Cấp 9'];
            } else {
              matchingBeltNames = ['Cấp 9', 'Cấp 10'];
            }
          }
        }

        // Try Korean name if no match
        if (matchingBeltNames.length === 0 && koreanName) {
          for (const [pattern, beltNames] of Object.entries(
            poomsaePatternMap,
          )) {
            if (koreanName.includes(pattern) || pattern.includes(koreanName)) {
              matchingBeltNames = beltNames;
              break;
            }
          }
        }

        // Try English name if no match
        if (matchingBeltNames.length === 0 && englishName) {
          const englishLower = englishName.toLowerCase();
          for (const [pattern, beltNames] of Object.entries(
            poomsaeEnglishMap,
          )) {
            const patternLower = pattern.toLowerCase();
            if (
              englishLower.includes(patternLower) ||
              patternLower.includes(englishLower)
            ) {
              matchingBeltNames = beltNames;
              break;
            }
          }
        }

        // Link to matching belt levels
        if (matchingBeltNames.length > 0) {
          for (const beltName of matchingBeltNames) {
            const beltLevel = beltLevels.find((b) => b.name === beltName);
            if (beltLevel) {
              // Check if link already exists
              const existingLink =
                await this.beltLevelPoomsaeRepository.findOne({
                  where: {
                    capDaiId: beltLevel.id,
                    baiQuyenId: poomsae.id,
                  },
                });

              if (!existingLink) {
                await this.linkBeltLevelToPoomsae(
                  beltLevel.id,
                  poomsae.id,
                  'bat_buoc',
                  1,
                );
                linkedCount++;
                linkedPairs.push({
                  beltLevelId: beltLevel.id,
                  poomsaeId: poomsae.id,
                });
                console.log(
                  `[PoomsaeService] Linked "${poomsae.tenBaiQuyenVietnamese}" (${poomsae.tenBaiQuyenKorean}) to "${beltLevel.name}"`,
                );
              }
            }
          }
        }
      }

      return {
        success: true,
        message: `Auto-linked ${linkedCount} poomsae(s) to belt levels`,
        linked: linkedCount,
      };
    } catch (error) {
      console.error('[PoomsaeService] Error auto-linking poomsae:', error);
      throw error;
    }
  }

  /**
   * Create Kĩ thuật poomsae and link to Cấp 10 and Cấp 9
   */
  async createAndLinkKiThuậtPoomsae(): Promise<{
    success: boolean;
    message: string;
    created: number;
    linked: number;
  }> {
    try {
      let createdCount = 0;
      let linkedCount = 0;

      // Check if Kĩ thuật 1 already exists
      let kt1 = await this.poomsaeRepository.findOne({
        where: [
          { tenBaiQuyenVietnamese: 'Kĩ thuật 1' },
          { tenBaiQuyenVietnamese: 'kĩ Thuật 1 Jang' },
          { tenBaiQuyenEnglish: 'Technique 1' },
        ],
      });

      // Create Kĩ thuật 1 if not exists
      if (!kt1) {
        kt1 = this.poomsaeRepository.create({
          tenBaiQuyenVietnamese: 'Kĩ thuật 1',
          tenBaiQuyenEnglish: 'Technique 1',
          tenBaiQuyenKorean: '기술 1',
          capDo: 'Cơ bản',
          moTa: 'Bài quyền kĩ thuật cơ bản đầu tiên cho cấp đai trắng',
          soDongTac: 15,
          thoiGianThucHien: 30,
          khoiLuongLyThuyet: 'Lý thuyết về kĩ thuật cơ bản',
        });
        kt1 = await this.poomsaeRepository.save(kt1);
        createdCount++;
        console.log('[PoomsaeService] Created Kĩ thuật 1 poomsae');
      }

      // Check if Kĩ thuật 2 already exists
      let kt2 = await this.poomsaeRepository.findOne({
        where: [
          { tenBaiQuyenVietnamese: 'Kĩ thuật 2' },
          { tenBaiQuyenEnglish: 'Technique 2' },
        ],
      });

      // Create Kĩ thuật 2 if not exists
      if (!kt2) {
        kt2 = this.poomsaeRepository.create({
          tenBaiQuyenVietnamese: 'Kĩ thuật 2',
          tenBaiQuyenEnglish: 'Technique 2',
          tenBaiQuyenKorean: '기술 2',
          capDo: 'Cơ bản',
          moTa: 'Bài quyền kĩ thuật cơ bản thứ hai cho cấp đai cam',
          soDongTac: 18,
          thoiGianThucHien: 35,
          khoiLuongLyThuyet: 'Lý thuyết về kĩ thuật cơ bản nâng cao',
        });
        kt2 = await this.poomsaeRepository.save(kt2);
        createdCount++;
        console.log('[PoomsaeService] Created Kĩ thuật 2 poomsae');
      }

      // Get Cấp 10 and Cấp 9 belt levels
      const cap10 = await this.beltLevelRepository.findOne({
        where: { name: 'Cấp 10' },
      });
      const cap9 = await this.beltLevelRepository.findOne({
        where: { name: 'Cấp 9' },
      });

      if (!cap10 || !cap9) {
        throw new Error('Cấp 10 or Cấp 9 belt level not found');
      }

      // Unlink existing Taegeuk poomsae from Cấp 10 and Cấp 9
      const existingLinks10 = await this.beltLevelPoomsaeRepository.find({
        where: { capDaiId: cap10.id },
      });
      for (const link of existingLinks10) {
        await this.beltLevelPoomsaeRepository.remove(link);
        console.log(
          `[PoomsaeService] Unlinked poomsae ${link.baiQuyenId} from Cấp 10`,
        );
      }

      const existingLinks9 = await this.beltLevelPoomsaeRepository.find({
        where: { capDaiId: cap9.id },
      });
      for (const link of existingLinks9) {
        await this.beltLevelPoomsaeRepository.remove(link);
        console.log(
          `[PoomsaeService] Unlinked poomsae ${link.baiQuyenId} from Cấp 9`,
        );
      }

      // Link Kĩ thuật 1 to Cấp 10
      const existingLink10 = await this.beltLevelPoomsaeRepository.findOne({
        where: {
          capDaiId: cap10.id,
          baiQuyenId: kt1.id,
        },
      });
      if (!existingLink10) {
        await this.linkBeltLevelToPoomsae(cap10.id, kt1.id, 'bat_buoc', 1);
        linkedCount++;
        console.log('[PoomsaeService] Linked Kĩ thuật 1 to Cấp 10');
      }

      // Link Kĩ thuật 2 to Cấp 9
      const existingLink9 = await this.beltLevelPoomsaeRepository.findOne({
        where: {
          capDaiId: cap9.id,
          baiQuyenId: kt2.id,
        },
      });
      if (!existingLink9) {
        await this.linkBeltLevelToPoomsae(cap9.id, kt2.id, 'bat_buoc', 1);
        linkedCount++;
        console.log('[PoomsaeService] Linked Kĩ thuật 2 to Cấp 9');
      }

      return {
        success: true,
        message: `Created ${createdCount} poomsae(s) and linked ${linkedCount} poomsae(s) to belt levels`,
        created: createdCount,
        linked: linkedCount,
      };
    } catch (error) {
      console.error(
        '[PoomsaeService] Error creating and linking Kĩ thuật poomsae:',
        error,
      );
      throw error;
    }
  }

  /**
   * Clean up duplicate poomsae links - keep only the correct one for each belt level
   * Each belt level should have only ONE poomsae
   */
  async cleanupDuplicatePoomsaeLinks(): Promise<{
    success: boolean;
    message: string;
    cleaned: number;
  }> {
    try {
      const allBeltLevels = await this.beltLevelRepository.find({
        order: { order_sequence: 'ASC' },
      });

      // Mapping: each belt level should have only ONE correct poomsae
      const correctPoomsaeMap: Record<string, string> = {
        'Cấp 10': 'Kĩ thuật 1',
        'Cấp 9': 'Kĩ thuật 2',
        'Cấp 8': 'Thái cực 1 Jang',
        'Cấp 7': 'Thái cực 2 Jang',
        'Cấp 6': 'Thái cực 3 Jang',
        'Cấp 5': 'Thái cực 4 Jang',
        'Cấp 4': 'Thái cực 5 Jang',
        'Cấp 3': 'Thái cực 6 Jang',
        'Cấp 2': 'Thái cực 7 Jang',
        'Cấp 1': 'Thái cực 8 Jang',
        'Nhất đẳng (1 Dan)': 'Koryo',
        'Nhị đẳng (2 Dan)': 'Keumgang',
        'Tam đẳng (3 Dan)': 'Taebaek',
        'Tứ đẳng (4 Dan)': 'Pyongwon',
        'Ngũ đẳng (5 Dan)': 'Sipjin',
        'Lục đẳng (6 Dan)': 'Jitae',
        'Thất đẳng (7 Dan)': 'Cheonkwon',
        'Bát đẳng (8 Dan)': 'Hansoo',
        'Cửu đẳng (9 Dan)': 'Ilyeo',
        'Thập đẳng (10 Dan)': 'Ilyeo',
      };

      let cleanedCount = 0;

      for (const beltLevel of allBeltLevels) {
        const correctPoomsaeName = correctPoomsaeMap[beltLevel.name];
        if (!correctPoomsaeName) {
          continue;
        }

        // Get all poomsae linked to this belt level
        const allLinks = await this.beltLevelPoomsaeRepository.find({
          where: { capDaiId: beltLevel.id },
          relations: ['poomsae'],
        });

        if (allLinks.length === 0) {
          continue;
        }

        // Find the correct poomsae
        const correctPoomsae = await this.poomsaeRepository.findOne({
          where: [
            { tenBaiQuyenVietnamese: correctPoomsaeName },
            { tenBaiQuyenEnglish: correctPoomsaeName },
            { tenBaiQuyenKorean: correctPoomsaeName },
          ],
        });

        if (!correctPoomsae) {
          console.warn(
            `[PoomsaeService] Cannot find correct poomsae "${correctPoomsaeName}" for "${beltLevel.name}"`,
          );
          continue;
        }

        // Check if correct poomsae is already linked
        const correctLink = allLinks.find(
          (link) => link.baiQuyenId === correctPoomsae.id,
        );

        // Remove all incorrect links
        for (const link of allLinks) {
          if (link.baiQuyenId !== correctPoomsae.id) {
            await this.beltLevelPoomsaeRepository.remove(link);
            cleanedCount++;
            console.log(
              `[PoomsaeService] Removed incorrect link: "${beltLevel.name}" -> poomsae ID ${link.baiQuyenId}`,
            );
          }
        }

        // If correct poomsae is not linked, link it
        if (!correctLink) {
          await this.linkBeltLevelToPoomsae(
            beltLevel.id,
            correctPoomsae.id,
            'bat_buoc',
            1,
          );
          console.log(
            `[PoomsaeService] Linked correct poomsae: "${beltLevel.name}" -> "${correctPoomsaeName}"`,
          );
        }
      }

      return {
        success: true,
        message: `Cleaned up ${cleanedCount} duplicate/incorrect poomsae link(s)`,
        cleaned: cleanedCount,
      };
    } catch (error) {
      console.error(
        '[PoomsaeService] Error cleaning up duplicate poomsae links:',
        error,
      );
      throw error;
    }
  }
}
