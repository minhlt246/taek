import { PartialType } from '@nestjs/mapped-types';
import { CreateLearningProgressDto } from './create-learning-progress.dto';

export class UpdateLearningProgressDto extends PartialType(
  CreateLearningProgressDto,
) {}
