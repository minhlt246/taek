import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['new', 'read', 'replied', 'closed'])
  status?: 'new' | 'read' | 'replied' | 'closed';
}
