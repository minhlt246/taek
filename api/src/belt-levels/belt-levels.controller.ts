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
    // Đảm bảo trả về đầy đủ dữ liệu, map order_sequence thành order nếu cần
    const formattedBeltLevel = {
      id: beltLevel.id,
      name: beltLevel.name,
      color: beltLevel.color || null,
      order_sequence: beltLevel.order_sequence || null,
      order: beltLevel.order_sequence || null, // Alias cho frontend compatibility
      description: beltLevel.description || null,
      created_at: beltLevel.created_at ? beltLevel.created_at.toISOString() : null,
      updated_at: beltLevel.updated_at ? beltLevel.updated_at.toISOString() : null,
    };
    return {
      success: true,
      message: 'Belt level created successfully',
      data: formattedBeltLevel,
    };
  }

  @Get()
  async findAll() {
    const beltLevels = await this.beltLevelsService.findAll();
    // Đảm bảo trả về đầy đủ dữ liệu, map order_sequence thành order nếu cần
    return beltLevels.map((belt) => ({
      id: belt.id,
      name: belt.name,
      color: belt.color || null,
      order_sequence: belt.order_sequence || null,
      order: belt.order_sequence || null, // Alias cho frontend compatibility
      description: belt.description || null,
      created_at: belt.created_at ? belt.created_at.toISOString() : null,
      updated_at: belt.updated_at ? belt.updated_at.toISOString() : null,
    }));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const beltLevel = await this.beltLevelsService.findOne(id);
    // Đảm bảo trả về đầy đủ dữ liệu, map order_sequence thành order nếu cần
    return {
      id: beltLevel.id,
      name: beltLevel.name,
      color: beltLevel.color || null,
      order_sequence: beltLevel.order_sequence || null,
      order: beltLevel.order_sequence || null, // Alias cho frontend compatibility
      description: beltLevel.description || null,
      created_at: beltLevel.created_at ? beltLevel.created_at.toISOString() : null,
      updated_at: beltLevel.updated_at ? beltLevel.updated_at.toISOString() : null,
    };
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const beltLevel = await this.beltLevelsService.findByName(name);
    // Đảm bảo trả về đầy đủ dữ liệu, map order_sequence thành order nếu cần
    return {
      id: beltLevel.id,
      name: beltLevel.name,
      color: beltLevel.color || null,
      order_sequence: beltLevel.order_sequence || null,
      order: beltLevel.order_sequence || null, // Alias cho frontend compatibility
      description: beltLevel.description || null,
      created_at: beltLevel.created_at ? beltLevel.created_at.toISOString() : null,
      updated_at: beltLevel.updated_at ? beltLevel.updated_at.toISOString() : null,
    };
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
    // Đảm bảo trả về đầy đủ dữ liệu, map order_sequence thành order nếu cần
    const formattedBeltLevel = {
      id: beltLevel.id,
      name: beltLevel.name,
      color: beltLevel.color || null,
      order_sequence: beltLevel.order_sequence || null,
      order: beltLevel.order_sequence || null, // Alias cho frontend compatibility
      description: beltLevel.description || null,
      created_at: beltLevel.created_at ? beltLevel.created_at.toISOString() : null,
      updated_at: beltLevel.updated_at ? beltLevel.updated_at.toISOString() : null,
    };
    return {
      success: true,
      message: 'Belt level updated successfully',
      data: formattedBeltLevel,
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

  @Post('fix-order-sequence')
  @HttpCode(HttpStatus.OK)
  async fixOrderSequence() {
    try {
      const result = await this.beltLevelsService.fixOrderSequence();
      return {
        success: result.success,
        message: result.message,
        updated: result.updated,
      };
    } catch (error: any) {
      console.error('[BeltLevelsController] Error fixing order sequence:', error);
      return {
        success: false,
        message: 'Error fixing order sequence',
        error: error?.message || 'Unknown error',
      };
    }
  }

  @Post('update-color-belts')
  @HttpCode(HttpStatus.OK)
  async updateColorBelts() {
    try {
      const result = await this.beltLevelsService.updateColorBeltLevels();
      return {
        success: result.success,
        message: result.message,
        updated: result.updated,
      };
    } catch (error: any) {
      console.error('[BeltLevelsController] Error updating color belts:', error);
      return {
        success: false,
        message: 'Error updating color belt levels',
        error: error?.message || 'Unknown error',
      };
    }
  }
}
