import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID события' })
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @ApiProperty({ example: 1, description: 'ID типа билета (Standard/VIP)' })
  @IsNumber()
  @IsNotEmpty()
  ticketTypeId: number;

  @ApiProperty({ example: 2, description: 'Количество билетов' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'SUMMER2026', description: 'Промокод (если есть)' })
  @IsString()
  @IsOptional()
  promocode?: string;
}