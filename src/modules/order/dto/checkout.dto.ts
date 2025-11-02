import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { PaymentProvider } from '../../../common/enums/payment-provider.enum';

export const CheckoutSchema = z.object({
  preferredPaymentProvider: z.nativeEnum(PaymentProvider).optional(),
});

export class CheckoutDto extends createZodDto(CheckoutSchema) {}

