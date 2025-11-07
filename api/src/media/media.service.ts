import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto, UpdateMediaDto } from './dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    const media = this.mediaRepository.create(createMediaDto);
    return await this.mediaRepository.save(media);
  }

  async findAll(): Promise<Media[]> {
    return await this.mediaRepository.find({
      relations: ['club', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['club', 'branch'],
    });

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  async findByType(file_type: 'image' | 'video'): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { file_type, is_active: true },
      relations: ['club', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findByClub(club_id: number): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { club_id, is_active: true },
      relations: ['club', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findByBranch(branch_id: number): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { branch_id, is_active: true },
      relations: ['club', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findActive(): Promise<Media[]> {
    return await this.mediaRepository.find({
      where: { is_active: true },
      relations: ['club', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.findOne(id);
    await this.mediaRepository.update(id, updateMediaDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    await this.mediaRepository.remove(media);
  }
}

