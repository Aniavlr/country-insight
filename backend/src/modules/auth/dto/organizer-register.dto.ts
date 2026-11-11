import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizerRegisterDto {
  @ApiProperty({
    example: 'org@example.com',
    description: 'Электронная почта организатора',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Пароль (мин. 6 символов)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'ООО "Вечеринка"',
    description: 'Название организации',
  })
  @IsString()
  @IsNotEmpty()
  organizerName: string;

  @ApiPropertyOptional({
    example: 'Мы организуем лучшие вечеринки в городе',
    description: 'Описание организации',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: 'ID города из справочника' })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    example: 1,
    description: 'ID типа организатора из справочника',
  })
  @IsNumber()
  organizerTypeId: number;
}
