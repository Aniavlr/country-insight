import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity.js';

export class ChangeRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ORGANIZER })
  @IsEnum(UserRole)
  role: UserRole;
}