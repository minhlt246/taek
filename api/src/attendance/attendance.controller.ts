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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateAttendanceDto) {
    const attendance = await this.attendanceService.create(input);
    return {
      success: true,
      message: 'Attendance created successfully',
      data: attendance,
    };
  }

  @Get()
  async findAll() {
    const attendances = await this.attendanceService.findAll();
    return attendances; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const attendance = await this.attendanceService.findOne(id);
    return attendance; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const attendances = await this.attendanceService.findByUser(user_id);
    return attendances; // Return array directly for frontend compatibility
  }

  @Get('course/:course_id')
  async findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    const attendances = await this.attendanceService.findByCourse(course_id);
    return attendances; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateAttendanceDto,
  ) {
    const attendance = await this.attendanceService.update(id, input);
    return {
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.attendanceService.remove(id);
    return {
      success: true,
      message: 'Attendance deleted successfully',
    };
  }
}
