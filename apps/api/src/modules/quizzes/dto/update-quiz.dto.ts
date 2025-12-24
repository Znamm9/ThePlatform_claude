import { PartialType } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateQuizDto extends PartialType(
  OmitType(CreateQuizDto, ['lessonId', 'questions'] as const)
) {}
