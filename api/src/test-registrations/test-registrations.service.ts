import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { TestRegistration } from './entities/test-registration.entity';
import { CreateTestRegistrationDto } from './dto/create-test-registration.dto';
import { UpdateTestRegistrationDto } from './dto/update-test-registration.dto';

@Injectable()
export class TestRegistrationsService {
  constructor(
    @InjectRepository(TestRegistration)
    private readonly testRegistrationRepository: Repository<TestRegistration>,
  ) {}

  async create(input: CreateTestRegistrationDto): Promise<TestRegistration> {
    const entity: TestRegistration = this.testRegistrationRepository.create(
      input as DeepPartial<TestRegistration>,
    );
    return await this.testRegistrationRepository.save(entity);
  }

  async findAll(): Promise<TestRegistration[]> {
    return await this.testRegistrationRepository.find({
      relations: {
        test: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TestRegistration> {
    const item = await this.testRegistrationRepository.findOne({
      where: { id },
      relations: {
        test: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
    });
    if (!item)
      throw new NotFoundException(`TestRegistration with ID ${id} not found`);
    return item;
  }

  async findByTest(test_id: number): Promise<TestRegistration[]> {
    return await this.testRegistrationRepository.find({
      where: { test_id },
      relations: {
        test: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(user_id: number): Promise<TestRegistration[]> {
    return await this.testRegistrationRepository.find({
      where: { user_id },
      relations: {
        test: true,
        user: true,
        current_belt: true,
        target_belt: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateTestRegistrationDto,
  ): Promise<TestRegistration> {
    const existing = await this.findOne(id);
    const merged = this.testRegistrationRepository.merge(
      existing,
      input as any,
    );
    await this.testRegistrationRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.testRegistrationRepository.remove(existing);
  }
}
