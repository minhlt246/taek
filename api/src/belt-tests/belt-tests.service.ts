import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { BeltTest } from './entities/belt-test.entity';
import { CreateBeltTestDto } from './dto/create-belt-test.dto';
import { UpdateBeltTestDto } from './dto/update-belt-test.dto';

@Injectable()
export class BeltTestsService {
  constructor(
    @InjectRepository(BeltTest)
    private readonly beltTestRepository: Repository<BeltTest>,
  ) {}

  async create(input: CreateBeltTestDto): Promise<BeltTest> {
    const entity: BeltTest = this.beltTestRepository.create({
      ...input,
      test_date: input.test_date
        ? (new Date(input.test_date) as any)
        : undefined,
      registration_deadline: input.registration_deadline
        ? (new Date(input.registration_deadline) as any)
        : undefined,
    } as DeepPartial<BeltTest>);
    return await this.beltTestRepository.save(entity);
  }

  async findAll(): Promise<BeltTest[]> {
    return await this.beltTestRepository.find({
      relations: { examiner: true, club: true, test_registrations: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BeltTest> {
    const item = await this.beltTestRepository.findOne({
      where: { id },
      relations: { examiner: true, club: true, test_registrations: true },
    });
    if (!item) throw new NotFoundException(`BeltTest with ID ${id} not found`);
    return item;
  }

  async findByClub(club_id: number): Promise<BeltTest[]> {
    return await this.beltTestRepository.find({
      where: { club_id },
      relations: { examiner: true, club: true, test_registrations: true },
      order: { created_at: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<BeltTest[]> {
    return await this.beltTestRepository.find({
      where: { status: status as any },
      relations: { examiner: true, club: true, test_registrations: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, input: UpdateBeltTestDto): Promise<BeltTest> {
    const existing = await this.findOne(id);
    const merged = this.beltTestRepository.merge(existing, {
      ...input,
      test_date: input.test_date
        ? (new Date(input.test_date) as any)
        : existing.test_date,
      registration_deadline: input.registration_deadline
        ? (new Date(input.registration_deadline) as any)
        : existing.registration_deadline,
    } as any);
    await this.beltTestRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.beltTestRepository.remove(existing);
  }
}
