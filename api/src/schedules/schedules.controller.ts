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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    const schedule = await this.schedulesService.create(createScheduleDto);
    return {
      success: true,
      message: 'Schedule created successfully',
      data: schedule,
    };
  }

  @Get()
  async findAll() {
    const schedules = await this.schedulesService.findAll();
    return schedules; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const schedule = await this.schedulesService.findOne(id);
    return schedule; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const schedules = await this.schedulesService.findByClub(club_id);
    return schedules; // Return array directly for frontend compatibility
  }

  @Get('branch/:branch_id')
  async findByBranch(@Param('branch_id', ParseIntPipe) branch_id: number) {
    const schedules = await this.schedulesService.findByBranch(branch_id);
    return schedules; // Return array directly for frontend compatibility
  }

  @Get('day/:day_of_week')
  async findByDay(@Param('day_of_week') day_of_week: string) {
    const schedules = await this.schedulesService.findByDay(day_of_week);
    return schedules; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    const schedule = await this.schedulesService.update(id, updateScheduleDto);
    return {
      success: true,
      message: 'Schedule updated successfully',
      data: schedule,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.schedulesService.remove(id);
    return {
      success: true,
      message: 'Schedule deleted successfully',
    };
  }
}
