import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async create(input: CreateCertificateDto): Promise<Certificate> {
    const entity: Certificate = this.certificateRepository.create({
      ...input,
      issue_date: input.issue_date
        ? (new Date(input.issue_date) as any)
        : undefined,
      expiry_date: input.expiry_date
        ? (new Date(input.expiry_date) as any)
        : undefined,
    } as DeepPartial<Certificate>);
    return await this.certificateRepository.save(entity);
  }

  async findAll(): Promise<Certificate[]> {
    return await this.certificateRepository.find({
      relations: { user: true, belt_level: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Certificate> {
    const item = await this.certificateRepository.findOne({
      where: { id },
      relations: { user: true, belt_level: true },
    });
    if (!item)
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    return item;
  }

  async findByUser(user_id: number): Promise<Certificate[]> {
    return await this.certificateRepository.find({
      where: { user_id },
      relations: { user: true, belt_level: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, input: UpdateCertificateDto): Promise<Certificate> {
    const existing = await this.findOne(id);
    const merged = this.certificateRepository.merge(existing, {
      ...input,
      issue_date: input.issue_date
        ? (new Date(input.issue_date) as any)
        : existing.issue_date,
      expiry_date: input.expiry_date
        ? (new Date(input.expiry_date) as any)
        : existing.expiry_date,
    } as any);
    await this.certificateRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.certificateRepository.remove(existing);
  }
}
