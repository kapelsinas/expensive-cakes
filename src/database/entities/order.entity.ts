import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Cart } from './cart.entity';
import { Currency } from '../../common/enums/currency.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Payment } from './payment.entity';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';

export type OrderItemSnapshot = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  currency: string;
};

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @OneToOne(() => Cart, (cart) => cart.order, { nullable: false })
  @JoinColumn()
  cart!: Cart;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    nullable: true,
  })
  preferredPaymentProvider?: PaymentProvider | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: string;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.EUR,
  })
  currency!: Currency;

  @Column({ type: 'jsonb' })
  itemsSnapshot!: OrderItemSnapshot[];

  @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
  payments!: Payment[];
}
