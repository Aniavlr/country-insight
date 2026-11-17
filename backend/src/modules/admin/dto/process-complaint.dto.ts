import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessComplaintDto {
  @ApiProperty({ example: 'resolved', enum: ['resolved', 'rejected'] })
  @IsString()
  @IsIn(['resolved', 'rejected'])
  status: string;
}