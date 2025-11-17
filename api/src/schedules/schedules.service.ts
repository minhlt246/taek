import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
import { IScheduleService } from './interfaces';

@Injectable()
export class SchedulesService implements IScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepository.create(createScheduleDto);
    return await this.scheduleRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      relations: ['course'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async findByCourse(courseId: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { courseId },
      relations: ['course'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findByDay(dayOfWeek: string): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { dayOfWeek },
      relations: ['course'],
      order: { startTime: 'ASC' },
    });
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    await this.findOne(id);
    await this.scheduleRepository.update(id, updateScheduleDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
  }
}
