import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

export class CreateQuizQuestionDto {
  @ApiProperty({ example: 'What is the capital of France?', description: 'The question text' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    enum: QuestionType,
    example: 'MULTIPLE_CHOICE',
    description: 'Type of question: MULTIPLE_CHOICE, TRUE_FALSE, or CODE_BASED'
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiPropertyOptional({
    example: ['Paris', 'London', 'Berlin', 'Madrid'],
    description: 'Array of options for MULTIPLE_CHOICE questions'
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({
    example: 'Paris',
    description: 'The correct answer. For MULTIPLE_CHOICE: string, TRUE_FALSE: boolean, CODE_BASED: expected output'
  })
  @IsNotEmpty()
  correctAnswer: any;

  @ApiPropertyOptional({
    example: 'Paris is the capital and largest city of France.',
    description: 'Explanation shown after answering'
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ example: 1, description: 'Points for this question', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ example: 0, description: 'Order of question in the quiz' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
