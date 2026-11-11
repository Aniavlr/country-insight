import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Анна', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'anna@gmail.com', description: 'Электронная почта' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Пароль (мин. 6 символов)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
