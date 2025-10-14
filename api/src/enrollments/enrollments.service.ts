import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './dto';
import { IEnrollmentService } from './interfaces';

@Injectable()
export class EnrollmentsService implements IEnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    // Check if user is already enrolled in this course
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        user_id: createEnrollmentDto.user_id,
        course_id: createEnrollmentDto.course_id,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('User is already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      relations: ['user', 'course'],
    });
  }

  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async findByUser(user_id: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { user_id },
      relations: ['user', 'course'],
    });
  }

  async findByCourse(course_id: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { course_id },
      relations: ['user', 'course'],
    });
  }

  async findByStatus(status: string): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { status: status as any },
      relations: ['user', 'course'],
    });
  }

  async update(
    id: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    await this.findOne(id);
    await this.enrollmentRepository.update(id, updateEnrollmentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }
}
