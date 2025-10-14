import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeltLevel } from './entities/belt-level.entity';
import { CreateBeltLevelDto, UpdateBeltLevelDto } from './dto';
import { IBeltLevelService } from './interfaces';

@Injectable()
export class BeltLevelsService implements IBeltLevelService {
  constructor(
    @InjectRepository(BeltLevel)
    private readonly beltLevelRepository: Repository<BeltLevel>,
  ) {}

  async create(createBeltLevelDto: CreateBeltLevelDto): Promise<BeltLevel> {
    // Check if name already exists
    const existingBeltLevel = await this.beltLevelRepository.findOne({
      where: { name: createBeltLevelDto.name },
    });

    if (existingBeltLevel) {
      throw new ConflictException('Belt level name already exists');
    }

    // Create belt level
    const beltLevel = this.beltLevelRepository.create(createBeltLevelDto);
    return await this.beltLevelRepository.save(beltLevel);
  }

  async findAll(): Promise<BeltLevel[]> {
    return await this.beltLevelRepository.find({
      order: { order_sequence: 'ASC' },
    });
  }

  async findOne(id: number): Promise<BeltLevel> {
    const beltLevel = await this.beltLevelRepository.findOne({
      where: { id },
    });

    if (!beltLevel) {
      throw new NotFoundException(`Belt level with ID ${id} not found`);
    }

    return beltLevel;
  }

  async findByName(name: string): Promise<BeltLevel> {
    const beltLevel = await this.beltLevelRepository.findOne({
      where: { name },
    });

    if (!beltLevel) {
      throw new NotFoundException(`Belt level with name ${name} not found`);
    }

    return beltLevel;
  }

  async update(
    id: number,
    updateBeltLevelDto: UpdateBeltLevelDto,
  ): Promise<BeltLevel> {
    const beltLevel = await this.findOne(id);

    // Check if name already exists (if being updated)
    if (updateBeltLevelDto.name && updateBeltLevelDto.name !== beltLevel.name) {
      const existingBeltLevel = await this.beltLevelRepository.findOne({
        where: { name: updateBeltLevelDto.name },
      });

      if (existingBeltLevel) {
        throw new ConflictException('Belt level name already exists');
      }
    }

    // Update belt level
    await this.beltLevelRepository.update(id, updateBeltLevelDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const beltLevel = await this.findOne(id);
    await this.beltLevelRepository.remove(beltLevel);
  }
}
