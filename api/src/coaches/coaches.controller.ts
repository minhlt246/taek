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
    // Format response to ensure all required fields are present
    return coaches.map((coach) => ({
      id: coach.id,
      ma_hoi_vien: coach.ma_hoi_vien || null,
      ho_va_ten: coach.ho_va_ten || null,
      name: coach.ho_va_ten || null, // Alias for frontend compatibility
      email: coach.email || null,
      phone: coach.phone || null,
      ma_clb: coach.ma_clb || null,
      role: coach.role || 'admin',
      belt_level_id: coach.belt_level_id || null,
      belt_level: coach.belt_level
        ? {
            id: coach.belt_level.id,
            name: coach.belt_level.name,
            color: coach.belt_level.color || null,
          }
        : null,
      is_active: coach.is_active !== false,
      created_at: coach.created_at ? coach.created_at.toISOString() : null,
      updated_at: coach.updated_at ? coach.updated_at.toISOString() : null,
    }));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const coach = await this.coachesService.findOne(id);
      return coach; // Return object directly for frontend compatibility
    } catch (error) {
      console.error('[Coaches Controller] Error in findOne:', {
        id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
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
}
