import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Initiate payment for an order
   */
  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  async initiatePayment(@CurrentUser() user: CurrentUserData, @Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(user.id, dto.orderId, dto.provider);
  }

  /**
   * Handle webhook from payment provider
   */
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') providerName: string,
    @Headers('x-webhook-signature') signature: string,
    @Body() payload: unknown,
  ) {
    const provider = providerName.toUpperCase() as PaymentProvider;
    await this.paymentService.handleWebhook(provider, signature || '', payload);
    return { received: true };
  }

  /**
   * Get payments for an order
   */
  @Get('order/:orderId')
  async getOrderPayments(
    @CurrentUser() user: CurrentUserData,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentService.getOrderPayments(user.id, orderId);
  }
}

