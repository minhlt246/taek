import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
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
    // Convert empty string to undefined for coach_code to avoid unique constraint violation
    // Process coach_code: remove whitespace and convert empty string to undefined
    let processedCoachCode: string | undefined = undefined;
    if (createCoachDto.coach_code !== undefined && createCoachDto.coach_code !== null) {
      const trimmed = createCoachDto.coach_code.trim();
      processedCoachCode = trimmed !== '' ? trimmed : undefined;
    }

    // Check if coach_code already exists (only if not undefined/empty)
    if (processedCoachCode) {
    const existingCoach = await this.coachRepository.findOne({
        where: { coach_code: processedCoachCode },
    });

    if (existingCoach) {
      throw new ConflictException('Coach code already exists');
    }
    }

    // Create coach data with processed coach_code
    const coachData: DeepPartial<Coach> = {
      ...createCoachDto,
      coach_code: processedCoachCode,
    };

    // Create and save coach
    const coach = this.coachRepository.create(coachData);
    return await this.coachRepository.save(coach);
  }

  async findAll(): Promise<Coach[]> {
    return await this.coachRepository.find({
      relations: ['club', 'branch', 'belt_level'],
      order: { role: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: ['club', 'branch', 'belt_level'],
    });

    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    return coach;
  }

  async findByCode(coach_code: string): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { coach_code },
      relations: ['club', 'branch', 'belt_level'],
    });

    if (!coach) {
      throw new NotFoundException(`Coach with code ${coach_code} not found`);
    }

    return coach;
  }

  async findByClub(club_id: number): Promise<Coach[]> {
    return await this.coachRepository.find({
      where: { club_id },
      relations: ['club', 'branch', 'belt_level'],
      order: { role: 'ASC', name: 'ASC' },
    });
  }

  async findHeadCoach(): Promise<Coach | null> {
    const headCoach = await this.coachRepository.findOne({
      where: { role: 'head_coach' },
      relations: ['club', 'branch', 'belt_level'],
    });

    return headCoach || null;
  }

  async update(id: number, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const coach = await this.findOne(id);

    // Convert empty string to undefined for coach_code to avoid unique constraint violation
    const updateData: DeepPartial<Coach> = { ...updateCoachDto };
    
    // Process coach_code: remove whitespace and convert empty string to undefined
    if (updateCoachDto.coach_code !== undefined && updateCoachDto.coach_code !== null) {
      const trimmed = updateCoachDto.coach_code.trim();
      updateData.coach_code = trimmed !== '' ? trimmed : undefined;
    }

    // Check if coach_code already exists (if being updated and not undefined/empty)
    if (
      updateData.coach_code &&
      updateData.coach_code !== coach.coach_code
    ) {
      const existingCoach = await this.coachRepository.findOne({
        where: { coach_code: updateData.coach_code },
      });

      if (existingCoach) {
        throw new ConflictException('Coach code already exists');
      }
    }

    // Update coach
    await this.coachRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const coach = await this.findOne(id);
    await this.coachRepository.remove(coach);
  }

  /**
   * Clean up duplicate coach_code entries
   * Converts empty strings to NULL to avoid unique constraint violations
   * @returns Promise<{ updated: number }>
   */
  async cleanupDuplicateCoachCodes(): Promise<{ updated: number }> {
    // Update all empty strings and whitespace-only strings to NULL
    const result = await this.coachRepository
      .createQueryBuilder()
      .update(Coach)
      .set({ coach_code: null as any })
      .where('coach_code = :empty', { empty: '' })
      .orWhere('TRIM(COALESCE(coach_code, "")) = :empty', { empty: '' })
      .execute();

    return { updated: result.affected || 0 };
  }
}
