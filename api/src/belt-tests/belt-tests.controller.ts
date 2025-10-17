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
import { BeltTestsService } from './belt-tests.service';
import { CreateBeltTestDto } from './dto/create-belt-test.dto';
import { UpdateBeltTestDto } from './dto/update-belt-test.dto';

@Controller('belt-tests')
export class BeltTestsController {
  constructor(private readonly beltTestsService: BeltTestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() input: CreateBeltTestDto) {
    return this.beltTestsService.create(input);
  }

  @Get()
  findAll() {
    return this.beltTestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.beltTestsService.findOne(id);
  }

  @Get('club/:club_id')
  findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    return this.beltTestsService.findByClub(club_id);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.beltTestsService.findByStatus(status);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateBeltTestDto,
  ) {
    return this.beltTestsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beltTestsService.remove(id);
  }
}
