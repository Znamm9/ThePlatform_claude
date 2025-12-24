import { IsString, IsNotEmpty, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Video ID',
    example: 'clxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({
    description: 'Last watched position in seconds',
    example: 120,
  })
  @IsInt()
  @Min(0)
  lastPositionSeconds: number;

  @ApiPropertyOptional({
    description: 'Total watched seconds',
    example: 240,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  watchedSeconds?: number;

  @ApiPropertyOptional({
    description: 'Whether the video is completed',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
