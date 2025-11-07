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
      relations: ['club', 'branch'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['club', 'branch'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async findByClub(club_id: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { club_id },
      relations: ['club', 'branch'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findByBranch(branch_id: number): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { branch_id },
      relations: ['club', 'branch'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findByDay(day_of_week: string): Promise<Schedule[]> {
    return await this.scheduleRepository.find({
      where: { day_of_week: day_of_week as any },
      relations: ['club', 'branch'],
      order: { start_time: 'ASC' },
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
