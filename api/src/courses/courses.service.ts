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
      const whereCondition: any = {};
      if (!includeInactive) {
        whereCondition.is_active = true;
      }

      const courses = await this.courseRepository.find({
        where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
        relations: ['club', 'branch', 'coach'],
        order: { created_at: 'DESC' },
      });

      return courses;
    } catch (error: any) {
      console.error('[CoursesService] Error in findAll:', error);
      console.error('[CoursesService] Error stack:', error?.stack);
      console.error('[CoursesService] Error message:', error?.message);
      
      // Fallback to simple find without relations if query fails
      try {
        const whereCondition: any = {};
        if (!includeInactive) {
          whereCondition.is_active = true;
        }
        const courses = await this.courseRepository.find({
          where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
          order: { created_at: 'DESC' },
        });
        return courses;
      } catch (fallbackError: any) {
        console.error('[CoursesService] Fallback also failed:', fallbackError);
        console.error('[CoursesService] Fallback error message:', fallbackError?.message);
        // If even fallback fails, return empty array to prevent 500 error
        return [];
      }
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
    try {
      // Load course with relations (schedules relation removed - schedules now reference club/branch)
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['club', 'branch', 'coach'],
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      // Count approved enrollments
      let studentCount = 0;
      try {
        studentCount = await this.enrollmentRepository.count({
          where: {
            course_id: id,
            status: 'approved',
          },
        });
      } catch (enrollmentError) {
        console.error('[CoursesService] Error counting enrollments:', enrollmentError);
        // Use current_students as fallback if enrollment count fails
        studentCount = course.current_students || 0;
      }

      return {
        ...course,
        studentCount,
      };
    } catch (error) {
      console.error('[CoursesService] Error in getDetail:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Failed to fetch course detail: ${error.message}`);
    }
  }
}
