import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Order } from './order.entity';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Currency } from '../../common/enums/currency.enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.payments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  order!: Order;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider!: PaymentProvider;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'enum', enum: Currency })
  currency!: Currency;

  @Column({ type: 'varchar', length: 120, nullable: true })
  externalId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  rawResponse?: Record<string, unknown> | null;
}
