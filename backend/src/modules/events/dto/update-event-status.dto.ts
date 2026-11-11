import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventStatusDto {
  @ApiProperty({ example: 3, description: 'ID нового статуса из справочника' })
  @IsNumber()
  @IsNotEmpty()
  statusId: number;
}
