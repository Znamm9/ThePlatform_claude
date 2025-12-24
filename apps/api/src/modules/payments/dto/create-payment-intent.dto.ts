import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'course-id-123', description: 'ID of the course to purchase' })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
