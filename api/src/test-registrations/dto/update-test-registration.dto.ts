import { PartialType } from '@nestjs/mapped-types';
import { CreateTestRegistrationDto } from './create-test-registration.dto';

export class UpdateTestRegistrationDto extends PartialType(
  CreateTestRegistrationDto,
) {}

