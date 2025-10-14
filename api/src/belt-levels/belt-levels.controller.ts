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
import { BeltLevelsService } from './belt-levels.service';
import { CreateBeltLevelDto, UpdateBeltLevelDto } from './dto';

@Controller('belt-levels')
export class BeltLevelsController {
  constructor(private readonly beltLevelsService: BeltLevelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBeltLevelDto: CreateBeltLevelDto) {
    return this.beltLevelsService.create(createBeltLevelDto);
  }

  @Get()
  findAll() {
    return this.beltLevelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.beltLevelsService.findOne(id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.beltLevelsService.findByName(name);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBeltLevelDto: UpdateBeltLevelDto,
  ) {
    return this.beltLevelsService.update(id, updateBeltLevelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beltLevelsService.remove(id);
  }
}
