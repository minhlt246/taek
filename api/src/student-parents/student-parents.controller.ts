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
  async create(@Body() createStudentParentDto: CreateStudentParentDto) {
    const studentParent = await this.studentParentsService.create(createStudentParentDto);
    return {
      success: true,
      message: 'Student parent relationship created successfully',
      data: studentParent,
    };
  }

  @Get()
  async findAll() {
    const studentParents = await this.studentParentsService.findAll();
    return studentParents; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const studentParent = await this.studentParentsService.findOne(id);
    return studentParent; // Return object directly for frontend compatibility
  }

  @Get('student/:student_id')
  async findByStudent(@Param('student_id', ParseIntPipe) student_id: number) {
    const studentParents = await this.studentParentsService.findByStudent(student_id);
    return studentParents; // Return array directly for frontend compatibility
  }

  @Get('parent/:parent_id')
  async findByParent(@Param('parent_id', ParseIntPipe) parent_id: number) {
    const studentParents = await this.studentParentsService.findByParent(parent_id);
    return studentParents; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentParentDto: UpdateStudentParentDto,
  ) {
    const studentParent = await this.studentParentsService.update(id, updateStudentParentDto);
    return {
      success: true,
      message: 'Student parent relationship updated successfully',
      data: studentParent,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.studentParentsService.remove(id);
    return {
      success: true,
      message: 'Student parent relationship deleted successfully',
    };
  }
}
