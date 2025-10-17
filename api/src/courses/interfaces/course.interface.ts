import { Course } from '../entities/course.entity';

export interface ICourseService {
  create(createCourseDto: any): Promise<Course>;
  findAll(): Promise<Course[]>;
  findOne(id: number): Promise<Course>;
  findByClub(club_id: number): Promise<Course[]>;
  findByBranch(branch_id: number): Promise<Course[]>;
  findByCoach(coach_id: number): Promise<Course[]>;
  findByLevel(level: string): Promise<Course[]>;
  findByQuarter(quarter: string, year?: number): Promise<Course[]>;
  findByYear(year: number): Promise<Course[]>;
  findByQuarterAndClub(
    quarter: string,
    club_id: number,
    year?: number,
  ): Promise<Course[]>;
  update(id: number, updateCourseDto: any): Promise<Course>;
  remove(id: number): Promise<void>;
}

export interface ICourseRepository {
  create(course: Partial<Course>): Promise<Course>;
  findAll(): Promise<Course[]>;
  findOne(id: number): Promise<Course>;
  findByClub(club_id: number): Promise<Course[]>;
  findByBranch(branch_id: number): Promise<Course[]>;
  findByCoach(coach_id: number): Promise<Course[]>;
  findByLevel(level: string): Promise<Course[]>;
  findByQuarter(quarter: string, year?: number): Promise<Course[]>;
  findByYear(year: number): Promise<Course[]>;
  findByQuarterAndClub(
    quarter: string,
    club_id: number,
    year?: number,
  ): Promise<Course[]>;
  update(id: number, course: Partial<Course>): Promise<Course>;
  remove(id: number): Promise<void>;
}
