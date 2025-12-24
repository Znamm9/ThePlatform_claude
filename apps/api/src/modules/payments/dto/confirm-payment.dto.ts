import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_123456789', description: 'Stripe Payment Intent ID' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}
