import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateCertificateDto) {
    const certificate = await this.certificatesService.create(input);
    return {
      success: true,
      message: 'Certificate created successfully',
      data: certificate,
    };
  }

  @Get()
  async findAll() {
    const certificates = await this.certificatesService.findAll();
    return certificates; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const certificate = await this.certificatesService.findOne(id);
    return certificate; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const certificates = await this.certificatesService.findByUser(user_id);
    return certificates; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateCertificateDto,
  ) {
    const certificate = await this.certificatesService.update(id, input);
    return {
      success: true,
      message: 'Certificate updated successfully',
      data: certificate,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.certificatesService.remove(id);
    return {
      success: true,
      message: 'Certificate deleted successfully',
    };
  }
}
