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
export class PayPalPaymentProvider extends PaymentProvider {
  readonly providerName = PaymentProviderEnum.PAYPAL;
  private readonly logger = new Logger(PayPalPaymentProvider.name);

  /**
   * Simulate PayPal order creation (redirect flow)
   */
  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    this.logger.log(`Creating PayPal order for ${params.orderId}`);

    // Simulate PayPal API call
    const externalId = `PAYPAL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const redirectUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${externalId}`;

    return {
      externalId,
      status: PaymentStatus.REQUIRES_ACTION,
      amount: params.amount,
      currency: params.currency,
      redirectUrl,
      metadata: {
        orderId: params.orderId,
        provider: 'paypal',
        createdAt: new Date().toISOString(),
        flow: 'redirect',
      },
    };
  }

  /**
   * Handle PayPal webhook (IPN or REST API webhook)
   */
  async handleWebhook(payload: any): Promise<WebhookResult> {
    this.logger.log('Processing PayPal webhook');

    // Simulate webhook processing
    const event = payload as {
      event_type: string;
      resource: { id: string; status: string; amount: { value: string } };
    };

    let status = PaymentStatus.PENDING;

    if (
      event.event_type === 'PAYMENT.CAPTURE.COMPLETED' ||
      event.event_type === 'CHECKOUT.ORDER.APPROVED'
    ) {
      status = PaymentStatus.COMPLETED;
    } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
      status = PaymentStatus.FAILED;
    } else if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      status = PaymentStatus.REQUIRES_ACTION;
    }

    return {
      externalId: event.resource.id,
      status,
      metadata: {
        eventType: event.event_type,
        processedAt: new Date().toISOString(),
      },
      rawResponse: payload,
    };
  }

  /**
   * Verify PayPal webhook signature
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    // In production, verify using PayPal's webhook verification API
    // For demo, always return true
    this.logger.log('Verifying PayPal webhook signature (mock)');
    return true;
  }

  /**
   * Get payment status from PayPal
   */
  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    this.logger.log(`Fetching PayPal order status for ${externalId}`);

    // Simulate PayPal API call
    const random = Math.random();
    if (random > 0.7) {
      return PaymentStatus.COMPLETED;
    } else if (random > 0.3) {
      return PaymentStatus.REQUIRES_ACTION;
    } else {
      return PaymentStatus.FAILED;
    }
  }
}
