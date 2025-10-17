import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { ICourseService } from './interfaces';

@Injectable()
export class CoursesService implements ICourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: ['club', 'branch', 'coach'],
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['club', 'branch', 'coach'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findByClub(club_id: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { club_id },
      relations: ['club', 'branch', 'coach'],
    });
  }

  async findByCoach(coach_id: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { coach_id },
      relations: ['club', 'branch', 'coach'],
    });
  }

  async findByLevel(level: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { level: level as any },
      relations: ['club', 'branch', 'coach'],
    });
  }

  async findByQuarter(quarter: string, year?: number): Promise<Course[]> {
    const whereCondition: any = { quarter: quarter as any };
    if (year) {
      whereCondition.year = year;
    }

    return await this.courseRepository.find({
      where: whereCondition,
      relations: ['club', 'branch', 'coach'],
    });
  }

  async findByYear(year: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { year },
      relations: ['club', 'branch', 'coach'],
      order: { quarter: 'ASC' },
    });
  }

  async findByBranch(branch_id: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { branch_id },
      relations: ['club', 'branch', 'coach'],
    });
  }

  async findByQuarterAndClub(
    quarter: string,
    club_id: number,
    year?: number,
  ): Promise<Course[]> {
    const whereCondition: any = {
      quarter: quarter as any,
      club_id,
    };
    if (year) {
      whereCondition.year = year;
    }

    return await this.courseRepository.find({
      where: whereCondition,
      relations: ['club', 'branch', 'coach'],
    });
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    await this.findOne(id);
    await this.courseRepository.update(id, updateCourseDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }
}
