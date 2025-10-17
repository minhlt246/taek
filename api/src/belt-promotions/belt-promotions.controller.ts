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
  create(@Body() input: CreateBeltPromotionDto) {
    return this.beltPromotionsService.create(input);
  }

  @Get()
  findAll() {
    return this.beltPromotionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.beltPromotionsService.findOne(id);
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.beltPromotionsService.findByUser(user_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateBeltPromotionDto,
  ) {
    return this.beltPromotionsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beltPromotionsService.remove(id);
  }
}
