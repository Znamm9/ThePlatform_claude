import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVideoDto {
  @ApiPropertyOptional({
    description: 'Video title',
    example: 'Introduction to Selenium WebDriver - Updated',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Video duration in seconds',
    example: 360,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail URL',
    example: 'https://cdn.example.com/thumbnails/video-123.jpg',
  })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Upload status',
    enum: ['UPLOADING', 'PROCESSING', 'READY', 'FAILED'],
    example: 'READY',
  })
  @IsEnum(['UPLOADING', 'PROCESSING', 'READY', 'FAILED'])
  @IsOptional()
  uploadStatus?: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
}
