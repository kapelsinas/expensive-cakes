import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Cart } from './cart.entity';
import { Currency } from '../../common/enums/currency.enum';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  cart!: Cart;

  @Column({ type: 'varchar', length: 64 })
  productId!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.EUR,
  })
  currency!: Currency;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;
}
