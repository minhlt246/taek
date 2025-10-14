import { PartialType } from '@nestjs/mapped-types';
import { CreateBeltLevelDto } from './create-belt-level.dto';

export class UpdateBeltLevelDto extends PartialType(CreateBeltLevelDto) {}
