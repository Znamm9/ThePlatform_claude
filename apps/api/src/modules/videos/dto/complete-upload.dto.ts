import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteUploadDto {
  @ApiProperty({
    description: 'S3 key where the video was uploaded',
    example: 'videos/clxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/video.mp4',
  })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 15728640,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  fileSizeBytes?: number;

  @ApiPropertyOptional({
    description: 'Video duration in seconds',
    example: 360,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;
}
