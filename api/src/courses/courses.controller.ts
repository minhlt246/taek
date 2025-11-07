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
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return {
      success: true,
      message: 'Course created successfully',
      data: course,
    };
  }

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    const courses = await this.coursesService.findAll(include);
    return courses; // Return array directly for frontend compatibility
  }

  @Get(':id/detail')
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const courseDetail = await this.coursesService.getDetail(id);
    return courseDetail; // Return course detail with student count
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const course = await this.coursesService.findOne(id);
    return course; // Return object directly for frontend compatibility
  }

  @Get('club/:club_id')
  async findByClub(@Param('club_id', ParseIntPipe) club_id: number) {
    const courses = await this.coursesService.findByClub(club_id);
    return courses; // Return array directly for frontend compatibility
  }

  @Get('branch/:branch_id')
  async findByBranch(@Param('branch_id', ParseIntPipe) branch_id: number) {
    const courses = await this.coursesService.findByBranch(branch_id);
    return courses; // Return array directly for frontend compatibility
  }

  @Get('coach/:coach_id')
  async findByCoach(@Param('coach_id', ParseIntPipe) coach_id: number) {
    const courses = await this.coursesService.findByCoach(coach_id);
    return courses; // Return array directly for frontend compatibility
  }

  @Get('level/:level')
  async findByLevel(@Param('level') level: string) {
    const courses = await this.coursesService.findByLevel(level);
    return courses; // Return array directly for frontend compatibility
  }

  @Get('quarter/:quarter')
  async findByQuarter(
    @Param('quarter') quarter: string,
    @Query('year') year?: number,
  ) {
    const courses = await this.coursesService.findByQuarter(quarter, year);
    return courses; // Return array directly for frontend compatibility
  }

  @Get('year/:year')
  async findByYear(@Param('year', ParseIntPipe) year: number) {
    const courses = await this.coursesService.findByYear(year);
    return courses; // Return array directly for frontend compatibility
  }

  @Get('quarter/:quarter/club/:club_id')
  async findByQuarterAndClub(
    @Param('quarter') quarter: string,
    @Param('club_id', ParseIntPipe) club_id: number,
    @Query('year') year?: number,
  ) {
    const courses = await this.coursesService.findByQuarterAndClub(quarter, club_id, year);
    return courses; // Return array directly for frontend compatibility
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return {
      success: true,
      message: 'Course updated successfully',
      data: course,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.coursesService.remove(id);
    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }
}
