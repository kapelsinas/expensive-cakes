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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentProvider } from '../../common/enums/payment-provider.enum';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate payment',
    description:
      'Create payment intent with selected provider (STRIPE, PAYPAL, MANUAL). ' +
      'Each provider returns different response based on their flow (clientSecret, redirectUrl, etc.)',
  })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Order already paid or cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async initiatePayment(@CurrentUser() user: CurrentUserData, @Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(user.id, dto.orderId, dto.provider);
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Payment webhook',
    description:
      'Handle webhooks from payment providers. Verifies signature and updates payment/order status. ' +
      'Supports STRIPE, PAYPAL, and MANUAL providers.',
  })
  @ApiParam({ name: 'provider', enum: PaymentProvider, description: 'Payment provider name' })
  @ApiHeader({ name: 'x-webhook-signature', description: 'Provider webhook signature for verification' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or unsupported provider' })
  async handleWebhook(
    @Param('provider') providerName: string,
    @Headers('x-webhook-signature') signature: string,
    @Body() payload: unknown,
  ) {
    const provider = providerName.toUpperCase() as PaymentProvider;
    await this.paymentService.handleWebhook(provider, signature || '', payload);
    return { received: true };
  }

  @Get('order/:orderId')
  @ApiOperation({
    summary: 'Get order payments',
    description: 'Retrieve all payment attempts for an order including failed attempts',
  })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderPayments(
    @CurrentUser() user: CurrentUserData,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentService.getOrderPayments(user.id, orderId);
  }
}

