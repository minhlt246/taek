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
  create(@Body() input: CreateTuitionPackageDto) {
    return this.tuitionPackagesService.create(input);
  }

  @Get()
  findAll() {
    return this.tuitionPackagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tuitionPackagesService.findOne(id);
  }

  @Get('club/:club_id')
  findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    return this.tuitionPackagesService.findByClub(club_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateTuitionPackageDto,
  ) {
    return this.tuitionPackagesService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tuitionPackagesService.remove(id);
  }
}
