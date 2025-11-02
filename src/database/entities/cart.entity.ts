import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';
import { CartStatus } from '../../common/enums/cart-status.enum';
import { Currency } from '../../common/enums/currency.enum';
import { Order } from './order.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @ManyToOne(() => User, (user) => user.carts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items!: CartItem[];

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status!: CartStatus;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.EUR,
  })
  currency!: Currency;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  subtotal!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  total!: string;

  @OneToOne(() => Order, (order) => order.cart, { nullable: true })
  order?: Order | null;
}
