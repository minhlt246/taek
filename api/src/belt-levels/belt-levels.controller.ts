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
  async create(@Body() createBeltLevelDto: CreateBeltLevelDto) {
    const beltLevel = await this.beltLevelsService.create(createBeltLevelDto);
    return {
      success: true,
      message: 'Belt level created successfully',
      data: beltLevel,
    };
  }

  @Get()
  async findAll() {
    const beltLevels = await this.beltLevelsService.findAll();
    return beltLevels; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const beltLevel = await this.beltLevelsService.findOne(id);
    return beltLevel; // Return object directly for frontend compatibility
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const beltLevel = await this.beltLevelsService.findByName(name);
    return beltLevel; // Return object directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBeltLevelDto: UpdateBeltLevelDto,
  ) {
    const beltLevel = await this.beltLevelsService.update(
      id,
      updateBeltLevelDto,
    );
    return {
      success: true,
      message: 'Belt level updated successfully',
      data: beltLevel,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.beltLevelsService.remove(id);
    return {
      success: true,
      message: 'Belt level deleted successfully',
    };
  }
}
