import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeltPromotion } from './entities/belt-promotion.entity';
import { BeltPromotionsService } from './belt-promotions.service';
import { BeltPromotionsController } from './belt-promotions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BeltPromotion])],
  controllers: [BeltPromotionsController],
  providers: [BeltPromotionsService],
  exports: [BeltPromotionsService],
})
export class BeltPromotionsModule {}
