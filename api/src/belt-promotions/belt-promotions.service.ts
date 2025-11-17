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
    try {
      // Try to load with all relations first
      return await this.beltPromotionRepository.find({
        relations: { user: true, from_belt: true, to_belt: true, coach: true },
        order: { created_at: 'DESC' },
      });
    } catch (error: any) {
      console.error('[BeltPromotionsService] Error in findAll with relations:', error);
      console.error('[BeltPromotionsService] Error message:', error?.message);
      console.error('[BeltPromotionsService] Error stack:', error?.stack);
      
      // Fallback to simple find without relations if query fails
      try {
        console.log('[BeltPromotionsService] Attempting fallback query without relations');
        const promotions = await this.beltPromotionRepository.find({
          order: { created_at: 'DESC' },
        });
        console.log('[BeltPromotionsService] Fallback query succeeded, returned', promotions.length, 'promotions');
        return promotions;
      } catch (fallbackError: any) {
        console.error('[BeltPromotionsService] Fallback also failed:', fallbackError);
        console.error('[BeltPromotionsService] Fallback error message:', fallbackError?.message);
        throw fallbackError;
      }
    }
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
