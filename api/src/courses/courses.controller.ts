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
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Get('club/:club_id')
  findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    return this.coursesService.findByClub(club_id);
  }

  @Get('branch/:branch_id')
  findByBranch(@Param('branch_id', ParseIntPipe) branch_id: number) {
    return this.coursesService.findByBranch(branch_id);
  }

  @Get('coach/:coach_id')
  findByCoach(@Param('coach_id', ParseIntPipe) coach_id: number) {
    return this.coursesService.findByCoach(coach_id);
  }

  @Get('level/:level')
  findByLevel(@Param('level') level: string) {
    return this.coursesService.findByLevel(level);
  }

  @Get('quarter/:quarter')
  findByQuarter(
    @Param('quarter') quarter: string,
    @Query('year') year?: number,
  ) {
    return this.coursesService.findByQuarter(quarter, year);
  }

  @Get('year/:year')
  findByYear(@Param('year', ParseIntPipe) year: number) {
    return this.coursesService.findByYear(year);
  }

  @Get('quarter/:quarter/club/:club_id')
  findByQuarterAndClub(
    @Param('quarter') quarter: string,
    @Param('club_id', ParseIntPipe) club_id: number,
    @Query('year') year?: number,
  ) {
    return this.coursesService.findByQuarterAndClub(quarter, club_id, year);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
