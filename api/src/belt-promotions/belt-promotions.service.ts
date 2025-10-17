import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { BeltPromotion } from './entities/belt-promotion.entity';
import { CreateBeltPromotionDto } from './dto/create-belt-promotion.dto';
import { UpdateBeltPromotionDto } from './dto/update-belt-promotion.dto';

@Injectable()
export class BeltPromotionsService {
  constructor(
    @InjectRepository(BeltPromotion)
    private readonly beltPromotionRepository: Repository<BeltPromotion>,
  ) {}

  async create(input: CreateBeltPromotionDto): Promise<BeltPromotion> {
    const entity: BeltPromotion = this.beltPromotionRepository.create({
      ...input,
      promotion_date: input.promotion_date
        ? (new Date(input.promotion_date) as any)
        : undefined,
    } as DeepPartial<BeltPromotion>);
    return await this.beltPromotionRepository.save(entity);
  }

  async findAll(): Promise<BeltPromotion[]> {
    return await this.beltPromotionRepository.find({
      relations: { user: true, from_belt: true, to_belt: true, coach: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BeltPromotion> {
    const item = await this.beltPromotionRepository.findOne({
      where: { id },
      relations: { user: true, from_belt: true, to_belt: true, coach: true },
    });
    if (!item)
      throw new NotFoundException(`BeltPromotion with ID ${id} not found`);
    return item;
  }

  async findByUser(user_id: number): Promise<BeltPromotion[]> {
    return await this.beltPromotionRepository.find({
      where: { user_id },
      relations: { user: true, from_belt: true, to_belt: true, coach: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    input: UpdateBeltPromotionDto,
  ): Promise<BeltPromotion> {
    const existing = await this.findOne(id);
    const merged = this.beltPromotionRepository.merge(existing, {
      ...input,
      promotion_date: input.promotion_date
        ? (new Date(input.promotion_date) as any)
        : existing.promotion_date,
    } as any);
    await this.beltPromotionRepository.save(merged);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.beltPromotionRepository.remove(existing);
  }
}
