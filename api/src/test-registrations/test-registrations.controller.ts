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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TestRegistrationsService } from './test-registrations.service';
import { CreateTestRegistrationDto } from './dto/create-test-registration.dto';
import { UpdateTestRegistrationDto } from './dto/update-test-registration.dto';
import { ImportExcelDto } from './dto/import-excel.dto';

type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('test-registrations')
@Controller('test-registrations')
export class TestRegistrationsController {
  constructor(
    private readonly testRegistrationsService: TestRegistrationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new test registration' })
  @ApiResponse({ status: 201, description: 'Test registration created successfully' })
  async create(@Body() createTestRegistrationDto: CreateTestRegistrationDto) {
    const registration = await this.testRegistrationsService.create(
      createTestRegistrationDto,
    );
    return {
      success: true,
      message: 'Test registration created successfully',
      data: registration,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all test registrations' })
  async findAll() {
    const registrations = await this.testRegistrationsService.findAll();
    return registrations;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test registration by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const registration = await this.testRegistrationsService.findOne(id);
    return registration;
  }

  @Get('test/:testId')
  @ApiOperation({ summary: 'Get all registrations for a test exam' })
  async findByTest(@Param('testId', ParseIntPipe) testId: number) {
    const registrations = await this.testRegistrationsService.findByTest(testId);
    return registrations;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all registrations for a user' })
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    const registrations = await this.testRegistrationsService.findByUser(userId);
    return registrations;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test registration' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestRegistrationDto: UpdateTestRegistrationDto,
  ) {
    const registration = await this.testRegistrationsService.update(
      id,
      updateTestRegistrationDto,
    );
    return {
      success: true,
      message: 'Test registration updated successfully',
      data: registration,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a test registration' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.testRegistrationsService.remove(id);
    return {
      success: true,
      message: 'Test registration deleted successfully',
    };
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import test results from Excel file',
    description:
      'Upload an Excel file to import test results. Expected format: Headers in first row (Mã hội viên, Họ tên, Cấp đai hiện tại, Cấp đai mục tiêu, Điểm, Kết quả, Ghi chú)',
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
          description: 'Optional test exam ID',
        },
        club_id: {
          type: 'number',
          description: 'Optional club ID',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file imported successfully',
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
    const clubId = body.club_id ? parseInt(String(body.club_id)) : undefined;

    const result = await this.testRegistrationsService.importFromExcel(
      file.buffer,
      testId,
      clubId,
      file.originalname,
    );

    return {
      success: result.success,
      message: result.message,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
        testExamId: result.testExamId,
      },
    };
  }
}

