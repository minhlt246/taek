import { Schedule } from '../entities/schedule.entity';

export interface IScheduleService {
  create(createScheduleDto: any): Promise<Schedule>;
  findAll(): Promise<Schedule[]>;
  findOne(id: number): Promise<Schedule>;
  findByCourse(course_id: number): Promise<Schedule[]>;
  findByDay(day_of_week: string): Promise<Schedule[]>;
  update(id: number, updateScheduleDto: any): Promise<Schedule>;
  remove(id: number): Promise<void>;
}

export interface IScheduleRepository {
  create(schedule: Partial<Schedule>): Promise<Schedule>;
  findAll(): Promise<Schedule[]>;
  findOne(id: number): Promise<Schedule>;
  findByCourse(course_id: number): Promise<Schedule[]>;
  findByDay(day_of_week: string): Promise<Schedule[]>;
  update(id: number, schedule: Partial<Schedule>): Promise<Schedule>;
  remove(id: number): Promise<void>;
}
