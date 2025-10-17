import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  async create(input: CreateFeedbackDto): Promise<Feedback> {
    const entity: Feedback = this.feedbackRepository.create(
      input as DeepPartial<Feedback>,
    );
    return await this.feedbackRepository.save(entity);
  }

  async findAll(): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      relations: { user: true, course: true, coach: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Feedback> {
    const item = await this.feedbackRepository.findOne({
      where: { id },
      relations: { user: true, course: true, coach: true },
    });
    if (!item) throw new NotFoundException(`Feedback with ID ${id} not found`);
    return item;
  }

  async findByUser(user_id: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { user_id },
      relations: { user: true, course: true, coach: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByCourse(course_id: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { course_id },
      relations: { user: true, course: true, coach: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByCoach(coach_id: number): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { coach_id },
      relations: { user: true, course: true, coach: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, input: UpdateFeedbackDto): Promise<Feedback> {
    const existing = await this.findOne(id);
    const merged = this.feedbackRepository.merge(existing, input as any);
    await this.feedbackRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.feedbackRepository.remove(existing);
  }
}
