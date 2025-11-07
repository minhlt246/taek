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
import { StudentEvaluationsService } from './student-evaluations.service';
import { CreateStudentEvaluationDto } from './dto/create-student-evaluation.dto';
import { UpdateStudentEvaluationDto } from './dto/update-student-evaluation.dto';

@Controller('student-evaluations')
export class StudentEvaluationsController {
  constructor(
    private readonly studentEvaluationsService: StudentEvaluationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateStudentEvaluationDto) {
    const evaluation = await this.studentEvaluationsService.create(input);
    return {
      success: true,
      message: 'Student evaluation created successfully',
      data: evaluation,
    };
  }

  @Get()
  async findAll() {
    const evaluations = await this.studentEvaluationsService.findAll();
    return evaluations; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const evaluation = await this.studentEvaluationsService.findOne(id);
    return evaluation; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const evaluations = await this.studentEvaluationsService.findByUser(user_id);
    return evaluations; // Return array directly for frontend compatibility
  }

  @Get('coach/:coach_id')
  async findByCoach(@Param('coach_id', ParseIntPipe) coach_id: number) {
    const evaluations = await this.studentEvaluationsService.findByCoach(coach_id);
    return evaluations; // Return array directly for frontend compatibility
  }

  @Get('course/:course_id')
  async findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    const evaluations = await this.studentEvaluationsService.findByCourse(course_id);
    return evaluations; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateStudentEvaluationDto,
  ) {
    const evaluation = await this.studentEvaluationsService.update(id, input);
    return {
      success: true,
      message: 'Student evaluation updated successfully',
      data: evaluation,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.studentEvaluationsService.remove(id);
    return {
      success: true,
      message: 'Student evaluation deleted successfully',
    };
  }
}
