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
import { TuitionPackagesService } from './tuition-packages.service';
import { CreateTuitionPackageDto } from './dto/create-tuition-package.dto';
import { UpdateTuitionPackageDto } from './dto/update-tuition-package.dto';

@Controller('tuition-packages')
export class TuitionPackagesController {
  constructor(
    private readonly tuitionPackagesService: TuitionPackagesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateTuitionPackageDto) {
    const package_ = await this.tuitionPackagesService.create(input);
    return {
      success: true,
      message: 'Tuition package created successfully',
      data: package_,
    };
  }

  @Get()
  async findAll() {
    const packages = await this.tuitionPackagesService.findAll();
    return packages; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const package_ = await this.tuitionPackagesService.findOne(id);
    return package_; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const packages = await this.tuitionPackagesService.findByClub(club_id);
    return packages; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateTuitionPackageDto,
  ) {
    const package_ = await this.tuitionPackagesService.update(id, input);
    return {
      success: true,
      message: 'Tuition package updated successfully',
      data: package_,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tuitionPackagesService.remove(id);
    return {
      success: true,
      message: 'Tuition package deleted successfully',
    };
  }
}
