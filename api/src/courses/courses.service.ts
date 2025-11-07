import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { ICourseService } from './interfaces';
import { Enrollment } from '../enrollments/entities/enrollment.entity';

@Injectable()
export class CoursesService implements ICourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(includeInactive: boolean = false): Promise<Course[]> {
    try {
      // Use query builder to handle NULL relations gracefully
      const queryBuilder = this.courseRepository.createQueryBuilder('course');
      
      // Add left joins to handle NULL foreign keys
      queryBuilder.leftJoinAndSelect('course.club', 'club');
      queryBuilder.leftJoinAndSelect('course.branch', 'branch');
      queryBuilder.leftJoinAndSelect('course.coach', 'coach');
      
      // Add where condition if needed
      if (!includeInactive) {
        queryBuilder.where('course.is_active = :isActive', { isActive: true });
      }
      
      // Add order by
      queryBuilder.orderBy('course.created_at', 'DESC');
      
      return await queryBuilder.getMany();
    } catch (error) {
      console.error('[CoursesService] Error in findAll:', error);
      // Fallback to simple find without relations if query builder fails
      const whereCondition: any = {};
      if (!includeInactive) {
        whereCondition.is_active = true;
      }
      return await this.courseRepository.find({
        where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
        order: { created_at: 'DESC' },
      });
    }
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
      where: { club_id, is_active: true },
      relations: ['club', 'branch', 'coach'],
      order: { created_at: 'DESC' },
    });
  }

  async findByCoach(coach_id: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { coach_id, is_active: true },
      relations: ['club', 'branch', 'coach'],
      order: { created_at: 'DESC' },
    });
  }

  async findByLevel(level: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { level: level as any, is_active: true },
      relations: ['club', 'branch', 'coach'],
      order: { created_at: 'DESC' },
    });
  }

  async findByQuarter(quarter: string, year?: number): Promise<Course[]> {
    const whereCondition: any = { quarter: quarter as any, is_active: true };
    if (year) {
      whereCondition.year = year;
    }

    return await this.courseRepository.find({
      where: whereCondition,
      relations: ['club', 'branch', 'coach'],
      order: { created_at: 'DESC' },
    });
  }

  async findByYear(year: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { year, is_active: true },
      relations: ['club', 'branch', 'coach'],
      order: { quarter: 'ASC', created_at: 'DESC' },
    });
  }

  async findByBranch(branch_id: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { branch_id, is_active: true },
      relations: ['club', 'branch', 'coach'],
      order: { created_at: 'DESC' },
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
      is_active: true,
    };
    if (year) {
      whereCondition.year = year;
    }

    return await this.courseRepository.find({
      where: whereCondition,
      relations: ['club', 'branch', 'coach'],
      order: { created_at: 'DESC' },
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

  async getDetail(id: number): Promise<Course & { studentCount: number }> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['club', 'branch', 'coach', 'schedules'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Count approved enrollments
    const studentCount = await this.enrollmentRepository.count({
      where: {
        course_id: id,
        status: 'approved',
      },
    });

    return {
      ...course,
      studentCount,
    };
  }
}
