import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { PaymentProvider } from '../../../common/enums/payment-provider.enum';

export const InitiatePaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  provider: z.nativeEnum(PaymentProvider),
});

export class InitiatePaymentDto extends createZodDto(InitiatePaymentSchema) {}

