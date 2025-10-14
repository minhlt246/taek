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
import { StudentParentsService } from './student-parents.service';
import { CreateStudentParentDto, UpdateStudentParentDto } from './dto';

@Controller('student-parents')
export class StudentParentsController {
  constructor(private readonly studentParentsService: StudentParentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createStudentParentDto: CreateStudentParentDto) {
    return this.studentParentsService.create(createStudentParentDto);
  }

  @Get()
  findAll() {
    return this.studentParentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentParentsService.findOne(id);
  }

  @Get('student/:student_id')
  findByStudent(@Param('student_id', ParseIntPipe) student_id: number) {
    return this.studentParentsService.findByStudent(student_id);
  }

  @Get('parent/:parent_id')
  findByParent(@Param('parent_id', ParseIntPipe) parent_id: number) {
    return this.studentParentsService.findByParent(parent_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentParentDto: UpdateStudentParentDto,
  ) {
    return this.studentParentsService.update(id, updateStudentParentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentParentsService.remove(id);
  }
}
