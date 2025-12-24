import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Introduction to Selenium' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Learn the basics of Selenium WebDriver' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Rich text content with code examples...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isFreePreview?: boolean;
}
