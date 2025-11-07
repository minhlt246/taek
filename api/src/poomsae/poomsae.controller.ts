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
import { PoomsaeService } from './poomsae.service';
import { CreatePoomsaeDto } from './dto/create-poomsae.dto';
import { UpdatePoomsaeDto } from './dto/update-poomsae.dto';

@Controller('poomsae')
export class PoomsaeController {
  constructor(private readonly poomsaeService: PoomsaeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPoomsaeDto: CreatePoomsaeDto) {
    const poomsae = await this.poomsaeService.create(createPoomsaeDto);
    return {
      success: true,
      message: 'Poomsae created successfully',
      data: poomsae,
    };
  }

  @Get()
  async findAll() {
    const poomsaes = await this.poomsaeService.findAll();
    return poomsaes; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const poomsae = await this.poomsaeService.findOne(id);
    return poomsae; // Return object directly for frontend compatibility
  }

  @Get('belt-level/:beltLevelId')
  async findByBeltLevel(@Param('beltLevelId', ParseIntPipe) beltLevelId: number) {
    const poomsaes = await this.poomsaeService.findByBeltLevel(beltLevelId);
    return poomsaes; // Return array directly for frontend compatibility
  }

  @Get('belt-level/:beltLevelId/required')
  async getRequiredPoomsaeForBeltLevel(
    @Param('beltLevelId', ParseIntPipe) beltLevelId: number,
  ) {
    const poomsaes = await this.poomsaeService.getRequiredPoomsaeForBeltLevel(beltLevelId);
    return poomsaes; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePoomsaeDto: UpdatePoomsaeDto,
  ) {
    const poomsae = await this.poomsaeService.update(id, updatePoomsaeDto);
    return {
      success: true,
      message: 'Poomsae updated successfully',
      data: poomsae,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.poomsaeService.remove(id);
    return {
      success: true,
      message: 'Poomsae deleted successfully',
    };
  }

  @Post('link-belt-level')
  @HttpCode(HttpStatus.CREATED)
  async linkBeltLevelToPoomsae(
    @Body()
    body: {
      beltLevelId: number;
      poomsaeId: number;
      loaiQuyen?: 'bat_buoc' | 'tu_chon' | 'bo_sung';
      thuTuUuTien?: number;
    },
  ) {
    const result = await this.poomsaeService.linkBeltLevelToPoomsae(
      body.beltLevelId,
      body.poomsaeId,
      body.loaiQuyen,
      body.thuTuUuTien,
    );
    return {
      success: true,
      message: 'Belt level linked to poomsae successfully',
      data: result,
    };
  }

  @Delete('unlink-belt-level')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkBeltLevelFromPoomsae(
    @Body() body: { beltLevelId: number; poomsaeId: number },
  ) {
    await this.poomsaeService.unlinkBeltLevelFromPoomsae(
      body.beltLevelId,
      body.poomsaeId,
    );
    return {
      success: true,
      message: 'Belt level unlinked from poomsae successfully',
    };
  }
}
