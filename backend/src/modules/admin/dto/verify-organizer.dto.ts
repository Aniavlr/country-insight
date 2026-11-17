import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOrganizerDto {
  @ApiProperty({ example: 'Одобрен', enum: ['Одобрен', 'Отклонён'] })
  @IsString()
  @IsIn(['Одобрен', 'Отклонён'])
  status: string;
}
