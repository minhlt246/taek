import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './entities/coach.entity';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { ICoachService } from './interfaces';

@Injectable()
export class CoachesService implements ICoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
  ) {}

  async create(createCoachDto: CreateCoachDto): Promise<Coach> {
    // Check if coach_code already exists
    const existingCoach = await this.coachRepository.findOne({
      where: { coach_code: createCoachDto.coach_code },
    });

    if (existingCoach) {
      throw new ConflictException('Coach code already exists');
    }

    // Create coach
    const coach = this.coachRepository.create(createCoachDto);
    return await this.coachRepository.save(coach);
  }

  async findAll(): Promise<Coach[]> {
    return await this.coachRepository.find({
      relations: ['club', 'belt_level'],
    });
  }

  async findOne(id: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: ['club', 'belt_level'],
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    return coach;
  }

  async findByCode(coach_code: string): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { coach_code },
      relations: ['club', 'belt_level'],
    });

    if (!coach) {
      throw new NotFoundException(`Coach with code ${coach_code} not found`);
    }

    return coach;
  }

  async findByClub(club_id: number): Promise<Coach[]> {
    return await this.coachRepository.find({
      where: { club_id },
      relations: ['club', 'belt_level'],
    });
  }

  async update(id: number, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const coach = await this.findOne(id);

    // Check if coach_code already exists (if being updated)
    if (
      updateCoachDto.coach_code &&
      updateCoachDto.coach_code !== coach.coach_code
    ) {
      const existingCoach = await this.coachRepository.findOne({
        where: { coach_code: updateCoachDto.coach_code },
      });

      if (existingCoach) {
        throw new ConflictException('Coach code already exists');
      }
    }

    // Update coach
    await this.coachRepository.update(id, updateCoachDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const coach = await this.findOne(id);
    await this.coachRepository.remove(coach);
  }
}
