import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizerDto {
  @ApiPropertyOptional({ example: 'ООО "Новое имя"' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Новое описание' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '+375291234567' })
  @IsString()
  @IsOptional()
  contacts?: string;

  @ApiPropertyOptional({ example: '@new_social' })
  @IsString()
  @IsOptional()
  socials?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 2, description: 'ID нового города' })
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({ example: [1, 2], description: 'Массив ID категорий' })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[];
}
