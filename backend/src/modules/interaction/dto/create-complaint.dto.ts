import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID отзыва (если жалуемся на отзыв)',
  })
  @IsNumber()
  @IsOptional()
  reviewId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID события (если жалуемся на событие)',
  })
  @IsNumber()
  @IsOptional()
  eventId?: number;

  @ApiProperty({
    example: 'Спам или оскорбления',
    description: 'Причина жалобы',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
