import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(999),
});

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {
  @ApiProperty({
    example: 5,
    description: 'Updated quantity',
    minimum: 1,
    maximum: 999,
  })
  quantity!: number;
}

