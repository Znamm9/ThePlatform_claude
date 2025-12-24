import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitExerciseDto {
  @ApiProperty({ example: 'exercise-id-123', description: 'ID of the exercise to submit' })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({
    example: 'function solution(input) {\n  return input * 2;\n}',
    description: 'The code solution submitted by the student'
  })
  @IsString()
  @IsNotEmpty()
  submittedCode: string;
}
