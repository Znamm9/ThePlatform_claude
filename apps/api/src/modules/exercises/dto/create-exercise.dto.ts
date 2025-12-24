import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseDifficulty } from '@prisma/client';

export class TestCaseDto {
  @ApiProperty({ example: '5', description: 'Input value for the test case' })
  @IsString()
  @IsNotEmpty()
  input: string;

  @ApiProperty({ example: '10', description: 'Expected output for the test case' })
  @IsString()
  @IsNotEmpty()
  expectedOutput: string;

  @ApiPropertyOptional({ example: 'Should double the input', description: 'Description of what the test case validates' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateExerciseDto {
  @ApiProperty({ example: 'lesson-id-123', description: 'ID of the lesson this exercise belongs to' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: 'Double the Number', description: 'Title of the exercise' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Write a function that doubles the input number', description: 'Brief description of the exercise' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Create a function called solution() that takes a number and returns it multiplied by 2',
    description: 'Detailed instructions for completing the exercise'
  })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiPropertyOptional({
    example: 'function solution(input) {\n  // Your code here\n}',
    description: 'Initial code template for students'
  })
  @IsString()
  @IsOptional()
  starterCode?: string;

  @ApiPropertyOptional({
    example: 'function solution(input) {\n  return input * 2;\n}',
    description: 'Reference solution (hidden from students)'
  })
  @IsString()
  @IsOptional()
  solutionCode?: string;

  @ApiPropertyOptional({
    type: [TestCaseDto],
    description: 'Array of test cases to validate submissions'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  @IsOptional()
  testCases?: TestCaseDto[];

  @ApiProperty({ enum: ExerciseDifficulty, example: 'EASY', description: 'Difficulty level of the exercise' })
  @IsEnum(ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @ApiPropertyOptional({ example: 10, description: 'Points awarded for completing the exercise', default: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ example: 0, description: 'Order of the exercise in the lesson' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
