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
} from '@nestjs/common';
import { PoomsaeService } from './poomsae.service';
import { CreatePoomsaeDto } from './dto/create-poomsae.dto';
import { UpdatePoomsaeDto } from './dto/update-poomsae.dto';

@Controller('poomsae')
export class PoomsaeController {
  constructor(private readonly poomsaeService: PoomsaeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPoomsaeDto: CreatePoomsaeDto) {
    const poomsae = await this.poomsaeService.create(createPoomsaeDto);
    return {
      success: true,
      message: 'Poomsae created successfully',
      data: poomsae,
    };
  }

  @Get()
  async findAll() {
    const poomsaes = await this.poomsaeService.findAll();
    // Format response to ensure camelCase format and all required fields
    return poomsaes.map((poomsae) => ({
      id: poomsae.id,
      tenBaiQuyenVietnamese: poomsae.tenBaiQuyenVietnamese || null,
      tenBaiQuyenEnglish: poomsae.tenBaiQuyenEnglish || null,
      tenBaiQuyenKorean: poomsae.tenBaiQuyenKorean || null,
      capDo: poomsae.capDo || null,
      moTa: poomsae.moTa || null,
      soDongTac: poomsae.soDongTac || null,
      thoiGianThucHien: poomsae.thoiGianThucHien || null,
      khoiLuongLyThuyet: poomsae.khoiLuongLyThuyet || null,
      createdAt: poomsae.createdAt ? poomsae.createdAt.toISOString() : null,
      updatedAt: poomsae.updatedAt ? poomsae.updatedAt.toISOString() : null,
      // Legacy fields for backward compatibility
      created_at: poomsae.createdAt ? poomsae.createdAt.toISOString() : null,
      updated_at: poomsae.updatedAt ? poomsae.updatedAt.toISOString() : null,
    }));
  }

  // IMPORTANT: Specific routes must be defined BEFORE dynamic routes like :id
  // Otherwise /poomsae/belt-level/:id will match :id route first and cause 500 error
  @Get('belt-level/:beltLevelId')
  async findByBeltLevel(
    @Param('beltLevelId', ParseIntPipe) beltLevelId: number,
  ) {
    try {
      console.log(
        `[PoomsaeController] Finding poomsae for belt level ${beltLevelId}`,
      );
      const poomsaes = await this.poomsaeService.findByBeltLevel(beltLevelId);
      console.log(
        `[PoomsaeController] Found ${poomsaes.length} poomsae(s) for belt level ${beltLevelId}`,
      );

      // Format response to ensure camelCase format and all required fields
      const formatted = poomsaes
        .map((poomsae) => {
          if (!poomsae) {
            console.warn(`[PoomsaeController] Null poomsae found in array`);
            return null;
          }
          try {
            return {
              id: poomsae.id,
              tenBaiQuyenVietnamese: poomsae.tenBaiQuyenVietnamese || null,
              tenBaiQuyenEnglish: poomsae.tenBaiQuyenEnglish || null,
              tenBaiQuyenKorean: poomsae.tenBaiQuyenKorean || null,
              capDo: poomsae.capDo || null,
              moTa: poomsae.moTa || null,
              soDongTac: poomsae.soDongTac || null,
              thoiGianThucHien: poomsae.thoiGianThucHien || null,
              khoiLuongLyThuyet: poomsae.khoiLuongLyThuyet || null,
              createdAt: poomsae.createdAt
                ? typeof poomsae.createdAt === 'string'
                  ? poomsae.createdAt
                  : poomsae.createdAt.toISOString()
                : null,
              updatedAt: poomsae.updatedAt
                ? typeof poomsae.updatedAt === 'string'
                  ? poomsae.updatedAt
                  : poomsae.updatedAt.toISOString()
                : null,
              // Legacy fields for backward compatibility
              created_at: poomsae.createdAt
                ? typeof poomsae.createdAt === 'string'
                  ? poomsae.createdAt
                  : poomsae.createdAt.toISOString()
                : null,
              updated_at: poomsae.updatedAt
                ? typeof poomsae.updatedAt === 'string'
                  ? poomsae.updatedAt
                  : poomsae.updatedAt.toISOString()
                : null,
            };
          } catch (error) {
            console.error(
              `[PoomsaeController] Error formatting poomsae ${poomsae.id}:`,
              error,
            );
            return null;
          }
        })
        .filter((item) => item !== null);

      console.log(
        `[PoomsaeController] Returning ${formatted.length} formatted poomsae(s)`,
      );
      return formatted;
    } catch (error) {
      console.error(
        `[PoomsaeController] Error finding poomsae for belt level ${beltLevelId}:`,
        error,
      );
      // Return empty array instead of throwing error to prevent 500
      return [];
    }
  }

  @Get('belt-level/:beltLevelId/required')
  async getRequiredPoomsaeForBeltLevel(
    @Param('beltLevelId', ParseIntPipe) beltLevelId: number,
  ) {
    const poomsaes =
      await this.poomsaeService.getRequiredPoomsaeForBeltLevel(beltLevelId);
    // Format response to ensure camelCase format and all required fields
    return poomsaes.map((poomsae) => ({
      id: poomsae.id,
      tenBaiQuyenVietnamese: poomsae.tenBaiQuyenVietnamese || null,
      tenBaiQuyenEnglish: poomsae.tenBaiQuyenEnglish || null,
      tenBaiQuyenKorean: poomsae.tenBaiQuyenKorean || null,
      capDo: poomsae.capDo || null,
      moTa: poomsae.moTa || null,
      soDongTac: poomsae.soDongTac || null,
      thoiGianThucHien: poomsae.thoiGianThucHien || null,
      khoiLuongLyThuyet: poomsae.khoiLuongLyThuyet || null,
      createdAt: poomsae.createdAt ? poomsae.createdAt.toISOString() : null,
      updatedAt: poomsae.updatedAt ? poomsae.updatedAt.toISOString() : null,
      // Legacy fields for backward compatibility
      created_at: poomsae.createdAt ? poomsae.createdAt.toISOString() : null,
      updated_at: poomsae.updatedAt ? poomsae.updatedAt.toISOString() : null,
    }));
  }

  // Dynamic route :id must be defined AFTER specific routes like 'belt-level/:beltLevelId'
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const poomsae = await this.poomsaeService.findOne(id);
    if (!poomsae) {
      return null;
    }
    // Format response to ensure camelCase format and all required fields
    return {
      id: poomsae.id,
      tenBaiQuyenVietnamese: poomsae.tenBaiQuyenVietnamese || null,
      tenBaiQuyenEnglish: poomsae.tenBaiQuyenEnglish || null,
      tenBaiQuyenKorean: poomsae.tenBaiQuyenKorean || null,
      capDo: poomsae.capDo || null,
      moTa: poomsae.moTa || null,
      soDongTac: poomsae.soDongTac || null,
      thoiGianThucHien: poomsae.thoiGianThucHien || null,
      khoiLuongLyThuyet: poomsae.khoiLuongLyThuyet || null,
      createdAt: poomsae.createdAt ? poomsae.createdAt.toISOString() : null,
      updatedAt: poomsae.updatedAt ? poomsae.updatedAt.toISOString() : null,
      // Legacy fields for backward compatibility
      created_at: poomsae.createdAt ? poomsae.createdAt.toISOString() : null,
      updated_at: poomsae.updatedAt ? poomsae.updatedAt.toISOString() : null,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePoomsaeDto: UpdatePoomsaeDto,
  ) {
    const poomsae = await this.poomsaeService.update(id, updatePoomsaeDto);
    return {
      success: true,
      message: 'Poomsae updated successfully',
      data: poomsae,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.poomsaeService.remove(id);
    return {
      success: true,
      message: 'Poomsae deleted successfully',
    };
  }

  @Post('link-belt-level')
  @HttpCode(HttpStatus.CREATED)
  async linkBeltLevelToPoomsae(
    @Body()
    body: {
      beltLevelId: number;
      poomsaeId: number;
      loaiQuyen?: 'bat_buoc' | 'tu_chon' | 'bo_sung';
      thuTuUuTien?: number;
    },
  ) {
    const result = await this.poomsaeService.linkBeltLevelToPoomsae(
      body.beltLevelId,
      body.poomsaeId,
      body.loaiQuyen,
      body.thuTuUuTien,
    );
    return {
      success: true,
      message: 'Belt level linked to poomsae successfully',
      data: result,
    };
  }

  @Delete('unlink-belt-level')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkBeltLevelFromPoomsae(
    @Body() body: { beltLevelId: number; poomsaeId: number },
  ) {
    await this.poomsaeService.unlinkBeltLevelFromPoomsae(
      body.beltLevelId,
      body.poomsaeId,
    );
    return {
      success: true,
      message: 'Belt level unlinked from poomsae successfully',
    };
  }

  @Post('auto-link-belt-levels')
  @HttpCode(HttpStatus.OK)
  async autoLinkPoomsaeToBeltLevels() {
    try {
      const result = await this.poomsaeService.autoLinkPoomsaeToBeltLevels();
      return {
        success: result.success,
        message: result.message,
        linked: result.linked,
      };
    } catch (error: any) {
      console.error('[PoomsaeController] Error auto-linking:', error);
      return {
        success: false,
        message: 'Error auto-linking poomsae to belt levels',
        error: error?.message || 'Unknown error',
      };
    }
  }

  @Post('create-ki-thuat-poomsae')
  @HttpCode(HttpStatus.OK)
  async createKiThuậtPoomsae() {
    try {
      const result = await this.poomsaeService.createAndLinkKiThuậtPoomsae();
      return {
        success: result.success,
        message: result.message,
        created: result.created,
        linked: result.linked,
      };
    } catch (error: any) {
      console.error(
        '[PoomsaeController] Error creating Kĩ thuật poomsae:',
        error,
      );
      return {
        success: false,
        message: 'Error creating Kĩ thuật poomsae',
        error: error?.message || 'Unknown error',
      };
    }
  }

  @Post('cleanup-duplicate-links')
  @HttpCode(HttpStatus.OK)
  async cleanupDuplicateLinks() {
    try {
      const result = await this.poomsaeService.cleanupDuplicatePoomsaeLinks();
      return {
        success: result.success,
        message: result.message,
        cleaned: result.cleaned,
      };
    } catch (error: any) {
      console.error(
        '[PoomsaeController] Error cleaning up duplicate links:',
        error,
      );
      return {
        success: false,
        message: 'Error cleaning up duplicate links',
        error: error?.message || 'Unknown error',
      };
    }
  }
}
