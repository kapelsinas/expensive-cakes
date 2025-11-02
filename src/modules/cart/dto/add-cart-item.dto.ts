import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../../common/enums/currency.enum';

// Max value for decimal(12,2) is 9999999999.99
const MAX_PRICE = '9999999999.99';

export const AddCartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(999).default(1),
  unitPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal price')
    .refine(
      (val) => parseFloat(val) <= parseFloat(MAX_PRICE),
      `Price must be less than ${MAX_PRICE}`,
    ),
  currency: z.nativeEnum(Currency).default(Currency.EUR),
  metadata: z.record(z.unknown()).optional(),
});

export class AddCartItemDto extends createZodDto(AddCartItemSchema) {
  @ApiProperty({
    example: 'laptop-001',
    description: 'Unique product identifier',
  })
  productId!: string;

  @ApiProperty({
    example: 'Gaming Laptop Pro',
    description: 'Product name',
  })
  name!: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity to add',
    default: 1,
    minimum: 1,
    maximum: 999,
  })
  quantity!: number;

  @ApiProperty({
    example: '1299.99',
    description: 'Unit price as decimal string (max 9999999999.99)',
  })
  unitPrice!: string;

  @ApiProperty({
    example: Currency.EUR,
    enum: Currency,
    default: Currency.EUR,
    description: 'Currency code',
  })
  currency!: Currency;

  @ApiProperty({
    example: { color: 'black', warranty: '2years' },
    description: 'Optional metadata',
    required: false,
  })
  metadata?: Record<string, unknown>;
}
