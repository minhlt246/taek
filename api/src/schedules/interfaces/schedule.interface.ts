import { Schedule } from '../entities/schedule.entity';

export interface IScheduleService {
  create(createScheduleDto: any): Promise<Schedule>;
  findAll(): Promise<Schedule[]>;
  findOne(id: number): Promise<Schedule>;
  findByCourse(courseId: number): Promise<Schedule[]>;
  findByDay(dayOfWeek: string): Promise<Schedule[]>;
  update(id: number, updateScheduleDto: any): Promise<Schedule>;
  remove(id: number): Promise<void>;
}

export interface IScheduleRepository {
  create(schedule: Partial<Schedule>): Promise<Schedule>;
  findAll(): Promise<Schedule[]>;
  findOne(id: number): Promise<Schedule>;
  findByCourse(courseId: number): Promise<Schedule[]>;
  findByDay(dayOfWeek: string): Promise<Schedule[]>;
  update(id: number, schedule: Partial<Schedule>): Promise<Schedule>;
  remove(id: number): Promise<void>;
}
