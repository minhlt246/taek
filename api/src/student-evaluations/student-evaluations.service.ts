import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { StudentEvaluation } from './entities/student-evaluation.entity';
import { CreateStudentEvaluationDto } from './dto/create-student-evaluation.dto';
import { UpdateStudentEvaluationDto } from './dto/update-student-evaluation.dto';

@Injectable()
export class StudentEvaluationsService {
  constructor(
    @InjectRepository(StudentEvaluation)
    private readonly studentEvaluationRepository: Repository<StudentEvaluation>,
  ) {}

  async create(input: CreateStudentEvaluationDto): Promise<StudentEvaluation> {
    const entity: StudentEvaluation = this.studentEvaluationRepository.create({
      ...input,
      evaluation_date: input.evaluation_date
        ? (new Date(input.evaluation_date) as any)
        : undefined,
    } as DeepPartial<StudentEvaluation>);
    return await this.studentEvaluationRepository.save(entity);
  }

  async findAll(): Promise<StudentEvaluation[]> {
    return await this.studentEvaluationRepository.find({
      relations: { user: true, coach: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<StudentEvaluation> {
    const item = await this.studentEvaluationRepository.findOne({
      where: { id },
      relations: { user: true, coach: true, course: true },
    });
    if (!item)
      throw new NotFoundException(`StudentEvaluation with ID ${id} not found`);
    return item;
  }

  async findByUser(user_id: number): Promise<StudentEvaluation[]> {
    return await this.studentEvaluationRepository.find({
      where: { user_id },
      relations: { user: true, coach: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByCoach(coach_id: number): Promise<StudentEvaluation[]> {
    return await this.studentEvaluationRepository.find({
      where: { coach_id },
      relations: { user: true, coach: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByCourse(course_id: number): Promise<StudentEvaluation[]> {
    return await this.studentEvaluationRepository.find({
      where: { course_id },
      relations: { user: true, coach: true, course: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateStudentEvaluationDto,
  ): Promise<StudentEvaluation> {
    const existing = await this.findOne(id);
    const merged = this.studentEvaluationRepository.merge(existing, {
      ...input,
      evaluation_date: input.evaluation_date
        ? (new Date(input.evaluation_date) as any)
        : existing.evaluation_date,
    } as any);
    await this.studentEvaluationRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.studentEvaluationRepository.remove(existing);
  }
}
