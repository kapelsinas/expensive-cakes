import { PaymentProvider as PaymentProviderEnum } from '../../../common/enums/payment-provider.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

export type CreatePaymentParams = {
  orderId: string;
  amount: string;
  currency: string;
};

export type PaymentIntent = {
  externalId: string;
  status: PaymentStatus;
  amount: string;
  currency: string;
  metadata?: Record<string, unknown>;
  clientSecret?: string;
  redirectUrl?: string;
};

export type WebhookResult = {
  externalId: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  rawResponse: Record<string, unknown>;
};

export abstract class PaymentProvider {
  abstract readonly providerName: PaymentProviderEnum;

  /**
   * Create a payment intent with the provider
   */
  abstract createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent>;

  /**
   * Handle webhook payload from provider
   */
  abstract handleWebhook(payload: unknown): Promise<WebhookResult>;

  /**
   * Verify webhook signature (for security)
   */
  abstract verifyWebhookSignature(signature: string, payload: string): boolean;

  /**
   * Get payment status from provider
   */
  abstract getPaymentStatus(externalId: string): Promise<PaymentStatus>;
}

