import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

export class CreateQuizDto {
  @ApiProperty({ example: 'lesson-id-123', description: 'ID of the lesson this quiz belongs to' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: 'Introduction to Testing Quiz', description: 'Title of the quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Test your knowledge of basic testing concepts',
    description: 'Description of the quiz'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 70, description: 'Minimum score percentage to pass', default: 70 })
  @IsInt()
  @Min(0)
  @IsOptional()
  passingScore?: number;

  @ApiPropertyOptional({ example: 30, description: 'Time limit in minutes (null for no limit)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  timeLimitMinutes?: number;

  @ApiPropertyOptional({
    type: [CreateQuizQuestionDto],
    description: 'Array of questions for the quiz'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  @IsOptional()
  questions?: CreateQuizQuestionDto[];

  @ApiPropertyOptional({ example: 0, description: 'Order of the quiz in the lesson' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
