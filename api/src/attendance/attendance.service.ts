import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async create(input: CreateAttendanceDto): Promise<Attendance> {
    const entity: Attendance = this.attendanceRepository.create({
      ...input,
      attendance_date: input.attendance_date
        ? (new Date(input.attendance_date) as any)
        : undefined,
    } as DeepPartial<Attendance>);
    return await this.attendanceRepository.save(entity);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      relations: { user: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Attendance> {
    const item = await this.attendanceRepository.findOne({
      where: { id },
      relations: { user: true, course: true },
    });
    if (!item)
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    return item;
  }

  async findByUser(user_id: number): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: { user_id },
      relations: { user: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByCourse(course_id: number): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: { course_id },
      relations: { user: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, input: UpdateAttendanceDto): Promise<Attendance> {
    const existing = await this.findOne(id);
    const merged = this.attendanceRepository.merge(existing, {
      ...input,
      attendance_date: input.attendance_date
        ? (new Date(input.attendance_date) as any)
        : existing.attendance_date,
    } as any);
    await this.attendanceRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.attendanceRepository.remove(existing);
  }
}
