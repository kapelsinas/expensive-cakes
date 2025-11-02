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
export class ManualPaymentProvider extends PaymentProvider {
  readonly providerName = PaymentProviderEnum.MANUAL;
  private readonly logger = new Logger(ManualPaymentProvider.name);

  /**
   * Manual payment - instant approval for testing/demos
   */
  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    this.logger.log(`Creating manual payment for order ${params.orderId}`);

    const externalId = `MANUAL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Instant approval
    return {
      externalId,
      status: PaymentStatus.COMPLETED,
      amount: params.amount,
      currency: params.currency,
      metadata: {
        orderId: params.orderId,
        provider: 'manual',
        createdAt: new Date().toISOString(),
        autoApproved: true,
      },
    };
  }

  /**
   * Handle manual payment webhook (not typically used)
   */
  async handleWebhook(payload: any): Promise<WebhookResult> {
    this.logger.log('Processing manual payment webhook');

    return {
      externalId: payload.id || 'manual-webhook',
      status: PaymentStatus.COMPLETED,
      metadata: {
        processedAt: new Date().toISOString(),
      },
      rawResponse: payload,
    };
  }

  /**
   * No signature verification for manual payments
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    this.logger.log('Manual payment - signature verification skipped');
    return true;
  }

  /**
   * Get payment status - always completed for manual
   */
  async getPaymentStatus(externalId: string): Promise<PaymentStatus> {
    this.logger.log(`Fetching manual payment status for ${externalId}`);
    return PaymentStatus.COMPLETED;
  }
}

