import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';
import { Order } from '../../database/entities/order.entity';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentProvider as PaymentProviderEnum } from '../../common/enums/payment-provider.enum';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly paymentProviderFactory: PaymentProviderFactory,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Initiate payment for an order
   */
  async initiatePayment(
    userId: string,
    orderId: string,
    providerName: PaymentProviderEnum,
  ): Promise<Payment> {
    // Get order and verify ownership
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for cancelled order');
    }

    // Get the appropriate payment provider
    const provider = this.paymentProviderFactory.getProvider(providerName);

    this.logger.log(
      `Initiating payment for order ${orderId} with provider ${provider.providerName}`,
    );

    // Create payment intent with provider
    const paymentIntent = await provider.createPaymentIntent({
      orderId: order.id,
      amount: order.totalAmount,
      currency: order.currency,
    });

    // Save payment record
    const payment = this.paymentRepository.create({
      order,
      provider: provider.providerName,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      externalId: paymentIntent.externalId,
      metadata: paymentIntent.metadata ?? null,
      rawResponse: paymentIntent as unknown as Record<string, unknown>,
    });

    await this.paymentRepository.save(payment);

    // Update order status based on payment
    if (paymentIntent.status === PaymentStatus.COMPLETED) {
      await this.orderService.updateOrderStatus(order.id, OrderStatus.PAID);
    } else if (paymentIntent.status === PaymentStatus.FAILED) {
      await this.orderService.updateOrderStatus(order.id, OrderStatus.FAILED);
    }

    this.logger.log(`Payment ${payment.id} created with status ${payment.status}`);

    return payment;
  }

  /**
   * Handle webhook from payment provider
   */
  async handleWebhook(
    providerName: PaymentProviderEnum,
    signature: string,
    payload: unknown,
  ): Promise<void> {
    const provider = this.paymentProviderFactory.getProvider(providerName);

    this.logger.log(`Received webhook from ${provider.providerName}`);

    // Verify webhook signature
    if (!provider.verifyWebhookSignature(signature, JSON.stringify(payload))) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process webhook
    const result = await provider.handleWebhook(payload);

    // Find payment by external ID
    const payment = await this.paymentRepository.findOne({
      where: { externalId: result.externalId },
      relations: ['order'],
    });

    if (!payment) {
      this.logger.warn(`Payment not found for external ID: ${result.externalId}`);
      return;
    }

    // Update payment status
    payment.status = result.status;
    payment.rawResponse = result.rawResponse;
    if (result.metadata) {
      payment.metadata = { ...payment.metadata, ...result.metadata };
    }

    await this.paymentRepository.save(payment);

    // Update order status based on payment result
    if (result.status === PaymentStatus.COMPLETED) {
      await this.orderService.updateOrderStatus(payment.order.id, OrderStatus.PAID);
      this.logger.log(`Order ${payment.order.id} marked as PAID`);
    } else if (result.status === PaymentStatus.FAILED) {
      await this.orderService.updateOrderStatus(payment.order.id, OrderStatus.FAILED);
      this.logger.log(`Order ${payment.order.id} marked as FAILED`);
    }
  }

  /**
   * Get payments for an order
   */
  async getOrderPayments(userId: string, orderId: string): Promise<Payment[]> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.paymentRepository.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });
  }
}

