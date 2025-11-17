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

  @Get('course/:courseId')
  async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    const schedules = await this.schedulesService.findByCourse(courseId);
    return schedules; // Return array directly for frontend compatibility
  }

  @Get('day/:dayOfWeek')
  async findByDay(@Param('dayOfWeek') dayOfWeek: string) {
    const schedules = await this.schedulesService.findByDay(dayOfWeek);
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
