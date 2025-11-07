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
import { ClubsService } from './clubs.service';
import { CreateClubDto, UpdateClubDto } from './dto';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClubDto: CreateClubDto) {
    const club = await this.clubsService.create(createClubDto);
    return {
      success: true,
      message: 'Club created successfully',
      data: club,
    };
  }

  @Get()
  async findAll() {
    const clubs = await this.clubsService.findAll();
    return clubs; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const club = await this.clubsService.findOne(id);
    return club; // Return object directly for frontend compatibility
  }

  @Get('code/:club_code')
  async findByCode(@Param('club_code') club_code: string) {
    const club = await this.clubsService.findByCode(club_code);
    return club; // Return object directly for frontend compatibility
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.clubsService.getStats(id);
    return stats; // Return stats directly for frontend compatibility
  }

  @Get(':id/overview')
  async getOverview(@Param('id', ParseIntPipe) id: number) {
    const overview = await this.clubsService.getOverview(id);
    return overview; // Return overview directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto,
  ) {
    const club = await this.clubsService.update(id, updateClubDto);
    return {
      success: true,
      message: 'Club updated successfully',
      data: club,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clubsService.remove(id);
    return {
      success: true,
      message: 'Club deleted successfully',
    };
  }
}
