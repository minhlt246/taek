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
  async create(@Body() input: CreateLearningProgressDto) {
    const progress = await this.learningProgressService.create(input);
    return {
      success: true,
      message: 'Learning progress created successfully',
      data: progress,
    };
  }

  @Get()
  async findAll() {
    const progresses = await this.learningProgressService.findAll();
    return progresses; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const progress = await this.learningProgressService.findOne(id);
    return progress; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const progresses = await this.learningProgressService.findByUser(user_id);
    return progresses; // Return array directly for frontend compatibility
  }

  @Get('course/:course_id')
  async findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    const progresses = await this.learningProgressService.findByCourse(course_id);
    return progresses; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateLearningProgressDto,
  ) {
    const progress = await this.learningProgressService.update(id, input);
    return {
      success: true,
      message: 'Learning progress updated successfully',
      data: progress,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.learningProgressService.remove(id);
    return {
      success: true,
      message: 'Learning progress deleted successfully',
    };
  }
}
