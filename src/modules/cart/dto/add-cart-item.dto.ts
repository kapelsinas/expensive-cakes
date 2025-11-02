import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { Currency } from '../../../common/enums/currency.enum';

export const AddCartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(999).default(1),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal price'),
  currency: z.nativeEnum(Currency).default(Currency.EUR),
  metadata: z.record(z.unknown()).optional(),
});

export class AddCartItemDto extends createZodDto(AddCartItemSchema) {}

