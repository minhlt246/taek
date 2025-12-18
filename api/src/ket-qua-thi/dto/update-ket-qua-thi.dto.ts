import { PartialType } from '@nestjs/mapped-types';
import { CreateKetQuaThiDto } from './create-ket-qua-thi.dto';

export class UpdateKetQuaThiDto extends PartialType(CreateKetQuaThiDto) {}

