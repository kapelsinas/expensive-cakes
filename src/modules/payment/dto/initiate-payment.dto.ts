import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '../../../common/enums/payment-provider.enum';

export const InitiatePaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  provider: z.nativeEnum(PaymentProvider),
});

export class InitiatePaymentDto extends createZodDto(InitiatePaymentSchema) {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
    format: 'uuid',
  })
  orderId!: string;

  @ApiProperty({
    example: PaymentProvider.STRIPE,
    enum: PaymentProvider,
    description: 'Payment provider to use',
  })
  provider!: PaymentProvider;
}

