import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentProvider,
  CreatePaymentParams,
  PaymentIntent,
  WebhookResult,
} from '../interfaces/payment-provider.interface';
import { PaymentProvider as PaymentProviderEnum } from '../../../common/enums/payment-provider.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

@Injectable()
export class StripePaymentProvider extends PaymentProvider {
  readonly providerName = PaymentProviderEnum.STRIPE;
  private readonly logger = new Logger(StripePaymentProvider.name);

  /**
   * Simulate Stripe payment intent creation
   */
  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    this.logger.log(`Creating Stripe payment intent for order ${params.orderId}`);

    // Simulate Stripe API call
    const externalId = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const clientSecret = `${externalId}_secret_${Math.random().toString(36).substring(7)}`;

    return {
      externalId,
      status: PaymentStatus.PENDING,
      amount: params.amount,
      currency: params.currency,
      clientSecret,
      metadata: {
        orderId: params.orderId,
        provider: 'stripe',
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(payload: any): Promise<WebhookResult> {
    this.logger.log('Processing Stripe webhook');

    // Simulate webhook processing
    const event = payload as {
      type: string;
      data: { object: { id: string; status: string; amount: number } };
    };

    let status = PaymentStatus.PENDING;

    if (event.type === 'payment_intent.succeeded') {
      status = PaymentStatus.COMPLETED;
    } else if (event.type === 'payment_intent.payment_failed') {
      status = PaymentStatus.FAILED;
    } else if (event.type === 'payment_intent.requires_action') {
      status = PaymentStatus.REQUIRES_ACTION;
    }

    return {
      externalId: event.data.object.id,
      status,
      metadata: {
        eventType: event.type,
        processedAt: new Date().toISOString(),
      },
      rawResponse: payload,
    };
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    // In production, use Stripe's signature verification
    // For demo, always return true
    this.logger.log('Verifying Stripe webhook signature (mock)');
    return true;
  }

  /**
   * Get payment status from Stripe
   */
  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    this.logger.log(`Fetching payment status for ${externalId}`);

    // Simulate Stripe API call - randomly succeed or fail for demo
    const random = Math.random();
    if (random > 0.8) {
      return PaymentStatus.FAILED;
    } else if (random > 0.1) {
      return PaymentStatus.COMPLETED;
    } else {
      return PaymentStatus.REQUIRES_ACTION;
    }
  }
}

