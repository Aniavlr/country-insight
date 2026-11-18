import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatePromocodeDto {
  @ApiProperty({ example: 'SALE10' })
  @IsString()
  code: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  eventId: number;
}
