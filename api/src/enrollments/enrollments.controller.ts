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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    const enrollment = await this.enrollmentsService.create(createEnrollmentDto);
    return {
      success: true,
      message: 'Enrollment created successfully',
      data: enrollment,
    };
  }

  @Get()
  async findAll() {
    const enrollments = await this.enrollmentsService.findAll();
    return enrollments; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const enrollment = await this.enrollmentsService.findOne(id);
    return enrollment; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const enrollments = await this.enrollmentsService.findByUser(user_id);
    return enrollments; // Return array directly for frontend compatibility
  }

  @Get('course/:course_id')
  async findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    const enrollments = await this.enrollmentsService.findByCourse(course_id);
    return enrollments; // Return array directly for frontend compatibility
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    const enrollments = await this.enrollmentsService.findByStatus(status);
    return enrollments; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    const enrollment = await this.enrollmentsService.update(id, updateEnrollmentDto);
    return {
      success: true,
      message: 'Enrollment updated successfully',
      data: enrollment,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.enrollmentsService.remove(id);
    return {
      success: true,
      message: 'Enrollment deleted successfully',
    };
  }
}
