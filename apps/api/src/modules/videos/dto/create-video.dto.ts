import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({
    description: 'Video title',
    example: 'Introduction to Selenium WebDriver',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Lesson ID this video belongs to',
    example: 'clxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiPropertyOptional({
    description: 'File name for the video',
    example: 'selenium-intro.mp4',
  })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Content type of the video',
    example: 'video/mp4',
  })
  @IsString()
  @IsOptional()
  contentType?: string;
}
