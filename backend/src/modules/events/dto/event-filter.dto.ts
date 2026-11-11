import { IsOptional, IsNumber, IsString, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EventFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'ID города' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cityId?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID категории' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID формата (вайба)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  formatId?: number;

  @ApiPropertyOptional({ example: 3, description: 'ID возрастного ограничения' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ageLimitId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID типа организатора' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  organizerTypeId?: number;

  // Быстрый фильтр по периоду
  @ApiPropertyOptional({
    example: 'weekend',
    description: 'Период: today | weekend | week',
    enum: ['today', 'weekend', 'week'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['today', 'weekend', 'week'])
  period?: string;

  @ApiPropertyOptional({
    example: '2026-11-12',
    description: 'Начало периода (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-11-20',
    description: 'Конец периода (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    example: 'книга',
    description: 'Поиск по названию и описанию',
  })
  @IsOptional()
  @IsString()
  search?: string;


  @ApiPropertyOptional({
    example: 'date',
    description: 'Сортировка: date | popular | price_asc | price_desc',
    enum: ['date', 'popular', 'price_asc', 'price_desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['date', 'popular', 'price_asc', 'price_desc'])
  sortBy?: 'date' | 'popular' | 'price_asc' | 'price_desc';
}