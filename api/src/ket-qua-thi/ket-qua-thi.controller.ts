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
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { KetQuaThiService } from './ket-qua-thi.service';
import { CreateKetQuaThiDto, UpdateKetQuaThiDto, ImportExcelDto } from './dto';

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

@ApiTags('ket-qua-thi')
@Controller('ket-qua-thi')
export class KetQuaThiController {
  constructor(private readonly ketQuaThiService: KetQuaThiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new test result' })
  @ApiResponse({ status: 201, description: 'Test result created successfully' })
  async create(@Body() createKetQuaThiDto: CreateKetQuaThiDto) {
    const ketQuaThi = await this.ketQuaThiService.create(createKetQuaThiDto);
    return {
      success: true,
      message: 'Test result created successfully',
      data: ketQuaThi,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all test results' })
  @ApiResponse({ status: 200, description: 'List of test results' })
  async findAll(
    @Query('test_id') testId?: string,
    @Query('user_id') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (testId) {
      const results = await this.ketQuaThiService.findByTest(parseInt(testId));
      return {
        success: true,
        data: results,
      };
    }

    if (userId) {
      const results = await this.ketQuaThiService.findByUser(parseInt(userId));
      return {
        success: true,
        data: results,
      };
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 25;
    const results = await this.ketQuaThiService.findAll(pageNum, limitNum);
    return {
      success: true,
      data: results,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test result by ID' })
  @ApiResponse({ status: 200, description: 'Test result details' })
  @ApiResponse({ status: 404, description: 'Test result not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const ketQuaThi = await this.ketQuaThiService.findOne(id);
    return {
      success: true,
      data: ketQuaThi,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update test result' })
  @ApiResponse({ status: 200, description: 'Test result updated successfully' })
  @ApiResponse({ status: 404, description: 'Test result not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKetQuaThiDto: UpdateKetQuaThiDto,
  ) {
    const ketQuaThi = await this.ketQuaThiService.update(
      id,
      updateKetQuaThiDto,
    );
    return {
      success: true,
      message: 'Test result updated successfully',
      data: ketQuaThi,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete test result' })
  @ApiResponse({ status: 204, description: 'Test result deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test result not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.ketQuaThiService.remove(id);
    return {
      success: true,
      message: 'Test result deleted successfully',
    };
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import test results from Excel file',
    description:
      'Import multiple test results from Excel file. Expected columns: KỲ THI, MÃ CLB, MÃ HỘI VIÊN, CẤP ĐẠI DỰ THI, SỐ THI, HỌ VÀ TÊN, GIỚI TÍNH, NTNS, KỸ THUẬT TẤN CĂN BẢN, NGUYÊN TẮC PHÁT LỰC, CĂN BẢN TAY, KỸ THUẬT CHÂN, CĂN BẢN TỰ VỆ, BÀI QUYỀN, PHÂN THẾ BÀI QUYỀN, SONG ĐẤU, THỂ LỰC, KẾT QUẢ, GHI CHÚ',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        test_id: {
          type: 'number',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Test results imported successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or missing required columns',
  })
  async importExcel(
    @UploadedFile() file: MulterFile,
    @Body() body: ImportExcelDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
    ];

    const allowedExtensions = ['.xlsx', '.xls', '.xlsm'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (
      !allowedMimeTypes.includes(file.mimetype) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      throw new BadRequestException(
        'Invalid file type. Please upload an Excel file (.xlsx, .xls, .xlsm)',
      );
    }

    const testId = body.test_id ? parseInt(String(body.test_id)) : undefined;

    const result = await this.ketQuaThiService.importFromExcel(
      file.buffer,
      testId,
    );

    return {
      success: result.success,
      message: result.message,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
      },
    };
  }
}
