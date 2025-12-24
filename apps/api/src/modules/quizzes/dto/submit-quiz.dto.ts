import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizAnswerDto {
  @ApiProperty({ example: 'question-id-123', description: 'ID of the question being answered' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    example: 'Paris',
    description: 'The user\'s answer (string for MC, boolean for T/F, code string for CODE_BASED)'
  })
  @IsNotEmpty()
  userAnswer: any;
}

export class SubmitQuizDto {
  @ApiProperty({ example: 'quiz-id-123', description: 'ID of the quiz being submitted' })
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({
    type: [QuizAnswerDto],
    description: 'Array of answers to quiz questions'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];

  @ApiPropertyOptional({ example: 'attempt-id-123', description: 'ID of the quiz attempt (optional, for resuming)' })
  @IsString()
  @IsOptional()
  attemptId?: string;
}
