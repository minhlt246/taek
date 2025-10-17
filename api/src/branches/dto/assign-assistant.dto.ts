import { IsNumber } from 'class-validator';

export class AssignAssistantDto {
  @IsNumber()
  assistant_id: number;
}
