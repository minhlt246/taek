import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { LearningProgress } from './entities/learning-progress.entity';
import { CreateLearningProgressDto } from './dto/create-learning-progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning-progress.dto';

@Injectable()
export class LearningProgressService {
  constructor(
    @InjectRepository(LearningProgress)
    private readonly learningProgressRepository: Repository<LearningProgress>,
  ) {}

  async create(input: CreateLearningProgressDto): Promise<LearningProgress> {
    const entity: LearningProgress = this.learningProgressRepository.create({
      ...input,
      lesson_date: input.lesson_date
        ? (new Date(input.lesson_date) as any)
        : undefined,
    } as DeepPartial<LearningProgress>);
    return await this.learningProgressRepository.save(entity);
  }

  async findAll(): Promise<LearningProgress[]> {
    return await this.learningProgressRepository.find({
      relations: { user: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LearningProgress> {
    const item = await this.learningProgressRepository.findOne({
      where: { id },
      relations: { user: true, course: true },
    });
    if (!item)
      throw new NotFoundException(`LearningProgress with ID ${id} not found`);
    return item;
  }

  async findByUser(user_id: number): Promise<LearningProgress[]> {
    return await this.learningProgressRepository.find({
      where: { user_id },
      relations: { user: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByCourse(course_id: number): Promise<LearningProgress[]> {
    return await this.learningProgressRepository.find({
      where: { course_id },
      relations: { user: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateLearningProgressDto,
  ): Promise<LearningProgress> {
    const existing = await this.findOne(id);
    const merged = this.learningProgressRepository.merge(existing, {
      ...input,
      lesson_date: input.lesson_date
        ? (new Date(input.lesson_date) as any)
        : existing.lesson_date,
    } as any);
    await this.learningProgressRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.learningProgressRepository.remove(existing);
  }
}
