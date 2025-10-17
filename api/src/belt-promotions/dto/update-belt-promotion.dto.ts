import { PartialType } from '@nestjs/mapped-types';
import { CreateBeltPromotionDto } from './create-belt-promotion.dto';

export class UpdateBeltPromotionDto extends PartialType(
  CreateBeltPromotionDto,
) {}
