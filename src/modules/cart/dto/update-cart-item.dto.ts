import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(999),
});

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {}

