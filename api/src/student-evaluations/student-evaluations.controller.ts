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
  create(@Body() input: CreateStudentEvaluationDto) {
    return this.studentEvaluationsService.create(input);
  }

  @Get()
  findAll() {
    return this.studentEvaluationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentEvaluationsService.findOne(id);
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.studentEvaluationsService.findByUser(user_id);
  }

  @Get('coach/:coach_id')
  findByCoach(@Param('coach_id', ParseIntPipe) coach_id: number) {
    return this.studentEvaluationsService.findByCoach(coach_id);
  }

  @Get('course/:course_id')
  findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    return this.studentEvaluationsService.findByCourse(course_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateStudentEvaluationDto,
  ) {
    return this.studentEvaluationsService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentEvaluationsService.remove(id);
  }
}
