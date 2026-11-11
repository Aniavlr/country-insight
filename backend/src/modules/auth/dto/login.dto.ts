import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'anna@gmail.com', description: 'Электронная почта' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  password: string;
}