import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderLessonsDto {
  @ApiProperty({
    example: ['lesson-id-1', 'lesson-id-2', 'lesson-id-3'],
    description: 'Array of lesson IDs in desired order'
  })
  @IsArray()
  @IsString({ each: true })
  lessonIds: string[];
}
