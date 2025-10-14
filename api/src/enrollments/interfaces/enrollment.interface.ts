import { Enrollment } from '../entities/enrollment.entity';

export interface IEnrollmentService {
  create(createEnrollmentDto: any): Promise<Enrollment>;
  findAll(): Promise<Enrollment[]>;
  findOne(id: number): Promise<Enrollment>;
  findByUser(user_id: number): Promise<Enrollment[]>;
  findByCourse(course_id: number): Promise<Enrollment[]>;
  findByStatus(status: string): Promise<Enrollment[]>;
  update(id: number, updateEnrollmentDto: any): Promise<Enrollment>;
  remove(id: number): Promise<void>;
}

export interface IEnrollmentRepository {
  create(enrollment: Partial<Enrollment>): Promise<Enrollment>;
  findAll(): Promise<Enrollment[]>;
  findOne(id: number): Promise<Enrollment>;
  findByUser(user_id: number): Promise<Enrollment[]>;
  findByCourse(course_id: number): Promise<Enrollment[]>;
  findByStatus(status: string): Promise<Enrollment[]>;
  update(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment>;
  remove(id: number): Promise<void>;
}
