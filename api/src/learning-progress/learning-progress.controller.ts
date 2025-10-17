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
import { LearningProgressService } from './learning-progress.service';
import { CreateLearningProgressDto } from './dto/create-learning-progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning-progress.dto';

@Controller('learning-progress')
export class LearningProgressController {
  constructor(
    private readonly learningProgressService: LearningProgressService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() input: CreateLearningProgressDto) {
    return this.learningProgressService.create(input);
  }

  @Get()
  findAll() {
    return this.learningProgressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.learningProgressService.findOne(id);
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.learningProgressService.findByUser(user_id);
  }

  @Get('course/:course_id')
  findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    return this.learningProgressService.findByCourse(course_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateLearningProgressDto,
  ) {
    return this.learningProgressService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.learningProgressService.remove(id);
  }
}
