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
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateFeedbackDto) {
    const feedback = await this.feedbacksService.create(input);
    return {
      success: true,
      message: 'Feedback created successfully',
      data: feedback,
    };
  }

  @Get()
  async findAll() {
    const feedbacks = await this.feedbacksService.findAll();
    return feedbacks; // Return array directly for frontend compatibility
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const feedback = await this.feedbacksService.findOne(id);
    return feedback; // Return object directly for frontend compatibility
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    const feedbacks = await this.feedbacksService.findByUser(user_id);
    return feedbacks; // Return array directly for frontend compatibility
  }

  @Get('course/:course_id')
  async findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    const feedbacks = await this.feedbacksService.findByCourse(course_id);
    return feedbacks; // Return array directly for frontend compatibility
  }

  @Get('coach/:coach_id')
  async findByCoach(@Param('coach_id', ParseIntPipe) coach_id: number) {
    const feedbacks = await this.feedbacksService.findByCoach(coach_id);
    return feedbacks; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateFeedbackDto,
  ) {
    const feedback = await this.feedbacksService.update(id, input);
    return {
      success: true,
      message: 'Feedback updated successfully',
      data: feedback,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.feedbacksService.remove(id);
    return {
      success: true,
      message: 'Feedback deleted successfully',
    };
  }
}
