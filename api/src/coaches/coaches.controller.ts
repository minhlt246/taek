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
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCoachDto: CreateCoachDto) {
    const coach = await this.coachesService.create(createCoachDto);
    return {
      success: true,
      message: 'Coach created successfully',
      data: coach,
    };
  }

  @Get()
  async findAll() {
    const coaches = await this.coachesService.findAll();
    return coaches; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const coach = await this.coachesService.findOne(id);
    return coach; // Return object directly for frontend compatibility
  }

  @Get('code/:coach_code')
  async findByCode(@Param('coach_code') coach_code: string) {
    const coach = await this.coachesService.findByCode(coach_code);
    return coach; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const coaches = await this.coachesService.findByClub(club_id);
    return coaches; // Return array directly for frontend compatibility
  }

  @Get('head/coach')
  async findHeadCoach() {
    const coach = await this.coachesService.findHeadCoach();
    return coach; // Return object directly (can be null) for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoachDto: UpdateCoachDto,
  ) {
    const coach = await this.coachesService.update(id, updateCoachDto);
    return {
      success: true,
      message: 'Coach updated successfully',
      data: coach,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.coachesService.remove(id);
    return {
      success: true,
      message: 'Coach deleted successfully',
    };
  }

  @Post('cleanup/duplicate-codes')
  @HttpCode(HttpStatus.OK)
  async cleanupDuplicateCodes() {
    const result = await this.coachesService.cleanupDuplicateCoachCodes();
    return {
      success: true,
      message: 'Duplicate codes cleaned up successfully',
      data: result,
    };
  }
}
