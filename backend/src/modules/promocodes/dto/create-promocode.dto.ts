import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromocodeDto {
  @ApiProperty({ example: 'SUMMER2026', description: 'Уникальный код' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'percent',
    enum: ['percent', 'fixed'],
    description: 'Тип скидки',
  })
  @IsEnum(['percent', 'fixed'])
  discountType: 'percent' | 'fixed';

  @ApiProperty({
    example: 10,
    description: 'Размер скидки (если percent, то от 1 до 100)',
  })
  @IsNumber()
  @Min(1)
  discountValue: number;

  @ApiProperty({
    example: 100,
    description: 'Максимальное количество использований (0 - без лимита)',
  })
  @IsNumber()
  @Min(0)
  usageLimit: number;

  @ApiPropertyOptional({
    example: '2026-11-01T00:00:00Z',
    description: 'Дата начала действия',
  })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-01T00:00:00Z',
    description: 'Дата окончания действия',
  })
  @IsDateString()
  @IsOptional()
  validTo?: string;

  @ApiProperty({
    example: 1,
    description: 'ID события, к которому применяется промокод',
  })
  @IsNumber()
  eventId: number;
}
