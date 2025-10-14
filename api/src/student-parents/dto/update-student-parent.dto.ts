import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentParentDto } from './create-student-parent.dto';

export class UpdateStudentParentDto extends PartialType(
  CreateStudentParentDto,
) {}
