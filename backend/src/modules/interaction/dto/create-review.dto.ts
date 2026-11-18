import { IsNumber, IsString, IsOptional, Min, Max, IsArray, ArrayMaxSize} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 1, description: 'ID события' })
  @IsNumber()
  eventId: number;

  @ApiProperty({ example: 5, description: 'Оценка от 1 до 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Было очень круто!', description: 'Текст отзыва' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ example: ['https://example.com/photo.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(5)
  photoUrls?: string[];
}
