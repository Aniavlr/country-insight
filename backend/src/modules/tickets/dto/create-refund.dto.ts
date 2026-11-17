import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({ example: 1, description: 'ID заказа' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: 'Не смогу прийти', description: 'Причина возврата' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
