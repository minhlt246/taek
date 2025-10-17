import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { TuitionPackage } from './entities/tuition-package.entity';
import { CreateTuitionPackageDto } from './dto/create-tuition-package.dto';
import { UpdateTuitionPackageDto } from './dto/update-tuition-package.dto';

@Injectable()
export class TuitionPackagesService {
  constructor(
    @InjectRepository(TuitionPackage)
    private readonly tuitionPackageRepository: Repository<TuitionPackage>,
  ) {}

  async create(input: CreateTuitionPackageDto): Promise<TuitionPackage> {
    const entity: TuitionPackage = this.tuitionPackageRepository.create(
      input as DeepPartial<TuitionPackage>,
    );
    return await this.tuitionPackageRepository.save(entity);
  }

  async findAll(): Promise<TuitionPackage[]> {
    return await this.tuitionPackageRepository.find({
      relations: { club: true, payment_details: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TuitionPackage> {
    const item = await this.tuitionPackageRepository.findOne({
      where: { id },
      relations: { club: true, payment_details: true },
    });
    if (!item)
      throw new NotFoundException(`TuitionPackage with ID ${id} not found`);
    return item;
  }

  async findByClub(club_id: number): Promise<TuitionPackage[]> {
    return await this.tuitionPackageRepository.find({
      where: { club_id },
      relations: { club: true, payment_details: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateTuitionPackageDto,
  ): Promise<TuitionPackage> {
    const existing = await this.findOne(id);
    const merged = this.tuitionPackageRepository.merge(existing, input as any);
    await this.tuitionPackageRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.tuitionPackageRepository.remove(existing);
  }
}
