import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class CreateCourseDto {
  @ApiProperty({ example: 'QA Automation Bootcamp' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Learn QA automation from scratch' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Master QA automation skills' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiPropertyOptional({ example: 4999 })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceCents?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsInt()
  @IsOptional()
  estimatedDurationHours?: number;

  @ApiPropertyOptional({ enum: DifficultyLevel, example: 'BEGINNER' })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;
}
