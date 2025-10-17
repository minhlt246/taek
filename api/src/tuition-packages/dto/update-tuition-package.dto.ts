import { PartialType } from '@nestjs/mapped-types';
import { CreateTuitionPackageDto } from './create-tuition-package.dto';

export class UpdateTuitionPackageDto extends PartialType(
  CreateTuitionPackageDto,
) {}
