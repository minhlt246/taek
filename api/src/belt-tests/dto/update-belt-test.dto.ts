import { PartialType } from '@nestjs/mapped-types';
import { CreateBeltTestDto } from './create-belt-test.dto';

export class UpdateBeltTestDto extends PartialType(CreateBeltTestDto) {}
