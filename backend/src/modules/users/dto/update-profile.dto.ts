import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Анна' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: '+375291234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID города' })
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;
}