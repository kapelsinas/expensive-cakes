import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from '../../database/entities/payment.entity';
import { Order } from '../../database/entities/order.entity';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import { StripePaymentProvider } from './providers/stripe-payment.provider';
import { PayPalPaymentProvider } from './providers/paypal-payment.provider';
import { ManualPaymentProvider } from './providers/manual-payment.provider';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]), OrderModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentProviderFactory,
    StripePaymentProvider,
    PayPalPaymentProvider,
    ManualPaymentProvider,
  ],
  exports: [PaymentService, PaymentProviderFactory],
})
export class PaymentModule {}

