import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto, UpdateClubDto } from './dto';
import { IClubService } from './interfaces';
import { Branch } from '../branches/entities/branch.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class ClubsService implements IClubService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    // Check if club_code already exists
    const existingClub = await this.clubRepository.findOne({
      where: { club_code: createClubDto.club_code },
    });

    if (existingClub) {
      throw new ConflictException('Club code already exists');
    }

    // Create club
    const club = this.clubRepository.create(createClubDto);
    return await this.clubRepository.save(club);
  }

  async findAll(): Promise<Club[]> {
    return await this.clubRepository.find();
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async findByCode(club_code: string): Promise<Club> {
    const club = await this.clubRepository.findOne({
      where: { club_code },
    });

    if (!club) {
      throw new NotFoundException(`Club with code ${club_code} not found`);
    }

    return club;
  }

  async update(id: number, updateClubDto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);

    // Check if club_code already exists (if being updated)
    if (updateClubDto.club_code && updateClubDto.club_code !== club.club_code) {
      const existingClub = await this.clubRepository.findOne({
        where: { club_code: updateClubDto.club_code },
      });

      if (existingClub) {
        throw new ConflictException('Club code already exists');
      }
    }

    // Update club
    await this.clubRepository.update(id, updateClubDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const club = await this.findOne(id);
    await this.clubRepository.remove(club);
  }

  async getStats(id: number): Promise<{
    totalBranches: number;
    activeBranches: number;
    totalCourses: number;
    activeCourses: number;
  }> {
    const club = await this.findOne(id);

    const [totalBranches, activeBranches, totalCourses, activeCourses] =
      await Promise.all([
        this.branchRepository.count({ where: { club_id: id } }),
        this.branchRepository.count({
          where: { club_id: id, is_active: true },
        }),
        this.courseRepository.count({ where: { club_id: id } }),
        this.courseRepository.count({
          where: { club_id: id, is_active: true },
        }),
      ]);

    return {
      totalBranches,
      activeBranches,
      totalCourses,
      activeCourses,
    };
  }

  async getOverview(id: number): Promise<{
    club: Club;
    branches: Branch[];
    courses: Course[];
    stats: {
      totalBranches: number;
      activeBranches: number;
      totalCourses: number;
      activeCourses: number;
    };
  }> {
    const club = await this.clubRepository.findOne({
      where: { id },
      relations: ['head_coach'],
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    const [branches, courses, stats] = await Promise.all([
      this.branchRepository.find({
        where: { club_id: id },
        relations: ['managers', 'managers.manager', 'assistants', 'assistants.assistant'],
        order: { name: 'ASC' },
      }),
      this.courseRepository.find({
        where: { club_id: id, is_active: true },
        relations: ['branch', 'coach'],
        order: { created_at: 'DESC' },
      }),
      this.getStats(id),
    ]);

    return {
      club,
      branches,
      courses,
      stats,
    };
  }
}
