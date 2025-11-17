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
import { BeltPromotionsService } from './belt-promotions.service';
import { CreateBeltPromotionDto } from './dto/create-belt-promotion.dto';
import { UpdateBeltPromotionDto } from './dto/update-belt-promotion.dto';

@Controller('belt-promotions')
export class BeltPromotionsController {
  constructor(private readonly beltPromotionsService: BeltPromotionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateBeltPromotionDto) {
    const promotion = await this.beltPromotionsService.create(input);
    return {
      success: true,
      message: 'Belt promotion created successfully',
      data: promotion,
    };
  }

  @Get()
  async findAll() {
    try {
      const promotions = await this.beltPromotionsService.findAll();
      return promotions; // Return array directly for frontend compatibility
    } catch (error) {
      console.error('[BeltPromotionsController] Error in findAll:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const promotion = await this.beltPromotionsService.findOne(id);
    return promotion; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const promotions = await this.beltPromotionsService.findByUser(user_id);
    return promotions; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateBeltPromotionDto,
  ) {
    const promotion = await this.beltPromotionsService.update(id, input);
    return {
      success: true,
      message: 'Belt promotion updated successfully',
      data: promotion,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.beltPromotionsService.remove(id);
    return {
      success: true,
      message: 'Belt promotion deleted successfully',
    };
  }
}
