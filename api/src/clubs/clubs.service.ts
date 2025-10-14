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

@Injectable()
export class ClubsService implements IClubService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
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
}
