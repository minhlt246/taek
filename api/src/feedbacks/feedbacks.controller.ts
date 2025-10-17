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
  create(@Body() input: CreateFeedbackDto) {
    return this.feedbacksService.create(input);
  }

  @Get()
  findAll() {
    return this.feedbacksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feedbacksService.findOne(id);
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.feedbacksService.findByUser(user_id);
  }

  @Get('course/:course_id')
  findByCourse(@Param('course_id', ParseIntPipe) course_id: number) {
    return this.feedbacksService.findByCourse(course_id);
  }

  @Get('coach/:coach_id')
  findByCoach(@Param('coach_id', ParseIntPipe) coach_id: number) {
    return this.feedbacksService.findByCoach(coach_id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateFeedbackDto,
  ) {
    return this.feedbacksService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbacksService.remove(id);
  }
}
