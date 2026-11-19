import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DictionaryItemDto {
  @ApiProperty({ example: 'Минск' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'minsk' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Описание или код иконки' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'utensils' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ example: 'Минская область' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ example: 53.9045 })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 27.5615 })
  @IsNumber()
  @IsOptional()
  lon?: number;

  @ApiPropertyOptional({ example: 'events_attended >= 1' })
  @IsString()
  @IsOptional()
  condition?: string;
}
