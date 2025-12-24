import { IsString, IsOptional, IsInt, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'QA Fundamentals' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Learn the basics of QA testing' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'qa-fundamentals' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'https://example.com/icon.png' })
  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  sortOrder: number;
}
