import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PoomsaeService } from './poomsae.service';
import { CreatePoomsaeDto } from './dto/create-poomsae.dto';
import { UpdatePoomsaeDto } from './dto/update-poomsae.dto';

@Controller('poomsae')
export class PoomsaeController {
  constructor(private readonly poomsaeService: PoomsaeService) {}

  @Post()
  create(@Body() createPoomsaeDto: CreatePoomsaeDto) {
    return this.poomsaeService.create(createPoomsaeDto);
  }

  @Get()
  findAll() {
    return this.poomsaeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.poomsaeService.findOne(id);
  }

  @Get('belt-level/:beltLevelId')
  findByBeltLevel(@Param('beltLevelId', ParseIntPipe) beltLevelId: number) {
    return this.poomsaeService.findByBeltLevel(beltLevelId);
  }

  @Get('belt-level/:beltLevelId/required')
  getRequiredPoomsaeForBeltLevel(
    @Param('beltLevelId', ParseIntPipe) beltLevelId: number,
  ) {
    return this.poomsaeService.getRequiredPoomsaeForBeltLevel(beltLevelId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePoomsaeDto: UpdatePoomsaeDto,
  ) {
    return this.poomsaeService.update(id, updatePoomsaeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.poomsaeService.remove(id);
  }

  @Post('link-belt-level')
  linkBeltLevelToPoomsae(
    @Body()
    body: {
      beltLevelId: number;
      poomsaeId: number;
      loaiQuyen?: 'bat_buoc' | 'tu_chon' | 'bo_sung';
      thuTuUuTien?: number;
    },
  ) {
    return this.poomsaeService.linkBeltLevelToPoomsae(
      body.beltLevelId,
      body.poomsaeId,
      body.loaiQuyen,
      body.thuTuUuTien,
    );
  }

  @Delete('unlink-belt-level')
  unlinkBeltLevelFromPoomsae(
    @Body() body: { beltLevelId: number; poomsaeId: number },
  ) {
    return this.poomsaeService.unlinkBeltLevelFromPoomsae(
      body.beltLevelId,
      body.poomsaeId,
    );
  }
}
