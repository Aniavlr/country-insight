import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CreateTicketTypeDto } from './create-ticket-type.dto.js';

class LocationDto {
  @ApiProperty({ example: 'ул. Ленина, 5' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 53.9045 })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 27.5615 })
  @IsNumber()
  @IsOptional()
  lon?: number;

  @ApiPropertyOptional({ example: 'Вход со двора' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Ночная распродажа книг' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Приходите за эксклюзивными скидками!' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
  @IsString()
  @IsOptional()
  posterUrl?: string;

  @ApiProperty({
    example: '2026-10-12T19:00:00Z',
    description: 'Дата и время начала',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-10-12T23:00:00Z',
    description: 'Дата и время окончания',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 'Напиток и закуска включены' })
  @IsString()
  @IsOptional()
  includedInPrice?: string;

  @ApiPropertyOptional({ example: 'Smart casual' })
  @IsString()
  @IsOptional()
  dressCode?: string;

  @ApiPropertyOptional({ example: 'Хорошее настроение' })
  @IsString()
  @IsOptional()
  bringWithYou?: string;

  @ApiProperty({ example: 1, description: 'ID города' })
  @IsNumber()
  cityId: number;

  @ApiProperty({ example: 3, description: 'ID категории' })
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({ example: 1, description: 'ID формата/вайба' })
  @IsNumber()
  @IsOptional()
  formatId?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID возрастного ограничения',
  })
  @IsNumber()
  @IsOptional()
  ageLimitId?: number;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: [CreateTicketTypeDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeDto)
  ticketTypes: CreateTicketTypeDto[];

  @ApiPropertyOptional({ example: ['https://img1.jpg', 'https://img2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(5)
  images?: string[];
}
