import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Coach } from './entities/coach.entity';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { ICoachService } from './interfaces';
import { BeltLevel } from '../belt-levels/entities/belt-level.entity';
import { Club } from '../clubs/entities/club.entity';

@Injectable()
export class CoachesService implements ICoachService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(BeltLevel)
    private readonly beltLevelRepository: Repository<BeltLevel>,
  ) {}

  async create(createCoachDto: CreateCoachDto): Promise<Coach> {
    // Map name to ho_va_ten if name is provided but ho_va_ten is not
    const coachData: DeepPartial<Coach> = {
      ...createCoachDto,
      ho_va_ten: createCoachDto.ho_va_ten || createCoachDto.name,
    };
    // Remove name property if it exists to avoid confusion
    if ('name' in coachData) {
      delete (coachData as any).name;
    }

    // Create and save coach
    const coach = this.coachRepository.create(coachData);
    return await this.coachRepository.save(coach);
  }

  async findAll(): Promise<Coach[]> {
    try {
      // Load belt_level relation để có đầy đủ thông tin
      const coaches = await this.coachRepository.find({
        relations: ['belt_level'],
        order: { role: 'ASC', ho_va_ten: 'ASC' },
      });

      // Map coaches để đảm bảo có đầy đủ thông tin cho frontend
      return coaches.map((coach) => {
        const coachData: any = { ...coach };
        
        // Đảm bảo có belt_level object nếu có belt_level_id
        if (coach.belt_level_id && !coach.belt_level) {
          // Nếu không load được relation, sẽ được xử lý ở controller
        }
        
        return coachData;
      });
    } catch (error) {
      console.error('[Coaches Service] Error in findAll:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async findOne(id: number): Promise<Coach> {
    try {
      // Không load relation club và branch vì không có foreign key trực tiếp
      const coach = await this.coachRepository.findOne({
        where: { id },
      });

      if (!coach) {
        throw new NotFoundException(`Coach with ID ${id} not found`);
      }

      // Nếu có cap_dai_id, load belt_level riêng bằng cách query trực tiếp
      if (coach.belt_level_id) {
        try {
          const beltLevel = await this.beltLevelRepository.findOne({
            where: { id: coach.belt_level_id },
          });
          if (beltLevel) {
            (coach as any).belt_level = beltLevel;
          }
        } catch (beltLevelError) {
          console.warn(
            '[Coaches Service] Could not load belt_level:',
            beltLevelError,
          );
          // Không throw error, chỉ log warning
        }
      }

      return coach;
    } catch (error) {
      console.error('[Coaches Service] Error in findOne:', {
        id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async findByClub(club_id: number): Promise<Coach[]> {
    try {
      // Tìm club để lấy club_code
      const club = await this.clubRepository.findOne({
        where: { id: club_id },
      });

      if (!club) {
        throw new NotFoundException(`Club with ID ${club_id} not found`);
      }

      // Tìm coaches theo ma_clb (mã câu lạc bộ)
      // Format có thể là: CLB_00468 hoặc _00468
      // Cần tìm theo cả hai format để đảm bảo tìm được
      const clubCode = club.club_code;
      const clubCodeWithPrefix = `CLB${clubCode}`; // Nếu club_code là _00468 thì sẽ thành CLB_00468

      // Tìm coaches với ma_clb khớp với club_code hoặc format CLB_xxx
      const coaches = await this.coachRepository
        .createQueryBuilder('coach')
        .where(
          'coach.ma_clb = :clubCode OR coach.ma_clb = :clubCodeWithPrefix',
          {
            clubCode,
            clubCodeWithPrefix,
          },
        )
        .orderBy('coach.role', 'ASC')
        .addOrderBy('coach.ho_va_ten', 'ASC')
        .getMany();

      return coaches;
    } catch (error) {
      console.error('[Coaches Service] Error in findByClub:', {
        club_id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async findOwner(): Promise<Coach | null> {
    try {
      // Không load relation club và branch vì không có foreign key trực tiếp
      const owner = await this.coachRepository.findOne({
        where: { role: 'owner' },
      });

      return owner || null;
    } catch (error) {
      console.error('[Coaches Service] Error in findOwner:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // Deprecated: Use findOwner() instead
  async findHeadCoach(): Promise<Coach | null> {
    return this.findOwner();
  }

  async update(id: number, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    const coach = await this.findOne(id);

    const updateData: DeepPartial<Coach> = { ...updateCoachDto };

    // Map name to ho_va_ten if name is provided but ho_va_ten is not
    if (updateCoachDto.name && !updateCoachDto.ho_va_ten) {
      updateData.ho_va_ten = updateCoachDto.name;
    }
    // Remove name property if it exists to avoid confusion
    if ('name' in updateData) {
      delete (updateData as any).name;
    }

    // Update coach
    await this.coachRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const coach = await this.findOne(id);
    await this.coachRepository.remove(coach);
  }
}
