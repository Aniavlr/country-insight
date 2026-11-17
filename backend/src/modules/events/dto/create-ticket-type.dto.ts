import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'Standard' })
  @IsString()
  name: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  totalQuantity: number;

  @ApiProperty({
    example: 1,
    description: 'ID способа оплаты (Бесплатное, Платное...)',
  })
  @IsNumber()
  paymentTypeId: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Лимит билетов на одного пользователя (0 - без лимита)',
  })
  @IsNumber()
  @IsOptional()
  limitPerUser?: number;

  @ApiProperty({ example: '2026-10-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  salesStartDate?: string;

  @ApiProperty({ example: '2026-10-12T18:00:00Z' })
  @IsDateString()
  @IsOptional()
  salesEndDate?: string;
}
