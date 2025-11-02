import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentProvider as PaymentProviderEnum } from '../../../common/enums/payment-provider.enum';
import { StripePaymentProvider } from '../providers/stripe-payment.provider';
import { PayPalPaymentProvider } from '../providers/paypal-payment.provider';
import { ManualPaymentProvider } from '../providers/manual-payment.provider';

@Injectable()
export class PaymentProviderFactory {
  private readonly providers: Map<PaymentProviderEnum, PaymentProvider>;

  constructor(
    private readonly stripeProvider: StripePaymentProvider,
    private readonly paypalProvider: PayPalPaymentProvider,
    private readonly manualProvider: ManualPaymentProvider,
  ) {
    // Register all providers in the map with correct typing
    this.providers = new Map<PaymentProviderEnum, PaymentProvider>([
      [PaymentProviderEnum.STRIPE, this.stripeProvider],
      [PaymentProviderEnum.PAYPAL, this.paypalProvider],
      [PaymentProviderEnum.MANUAL, this.manualProvider],
    ]);
  }

  /**
   * Get payment provider by enum value
   */
  getProvider(providerName: PaymentProviderEnum): PaymentProvider {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new BadRequestException(`Payment provider ${providerName} is not supported`);
    }

    return provider;
  }

  /**
   * Get all available providers
   */
  getAllProviders(): PaymentProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if provider is supported
   */
  isProviderSupported(providerName: PaymentProviderEnum): boolean {
    return this.providers.has(providerName);
  }
}
