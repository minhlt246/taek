import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { CreateParentDto, UpdateParentDto } from './dto';
import { IParentService } from './interfaces';

@Injectable()
export class ParentsService implements IParentService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    const parent = this.parentRepository.create(createParentDto);
    return await this.parentRepository.save(parent);
  }

  async findAll(): Promise<Parent[]> {
    return await this.parentRepository.find();
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async findByRelationship(relationship: string): Promise<Parent[]> {
    return await this.parentRepository.find({
      where: { relationship: relationship as any },
    });
  }

  async update(id: number, updateParentDto: UpdateParentDto): Promise<Parent> {
    await this.findOne(id);
    await this.parentRepository.update(id, updateParentDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const parent = await this.findOne(id);
    await this.parentRepository.remove(parent);
  }
}
