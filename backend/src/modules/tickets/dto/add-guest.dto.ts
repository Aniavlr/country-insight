import { IsString, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddGuestDto {
  @ApiProperty({ example: 'Иван Иванов', description: 'Имя гостя' })
  @IsString()
  holderName: string;

  @ApiProperty({ example: 'ivan@example.com', description: 'Email гостя' })
  @IsEmail()
  holderEmail: string;

  @ApiProperty({ example: 1, description: 'ID типа билета' })
  @IsNumber()
  ticketTypeId: number;
}