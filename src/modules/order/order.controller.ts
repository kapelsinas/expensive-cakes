import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Checkout cart',
    description:
      'Transform active cart into order with transactional safety. Cart items are snapshot for audit trail.',
  })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Empty cart or invalid cart state' })
  @ApiResponse({ status: 404, description: 'No active cart found' })
  async checkout(@CurrentUser() user: CurrentUserData, @Body() dto: CheckoutDto) {
    return this.orderService.checkout(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List orders',
    description: 'Get all orders for current user with payment history',
  })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(@CurrentUser() user: CurrentUserData) {
    return this.orderService.getOrders(user.id);
  }

  @Get(':orderId/status')
  @ApiOperation({
    summary: 'Get order status (lightweight)',
    description: 'Get lightweight order status for polling. Returns only status, totalAmount, and currency.',
  })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.orderService.getOrderById(user.id, orderId);
    return {
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
    };
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Get order details',
    description: 'Retrieve specific order with payments and cart reference',
  })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@CurrentUser() user: CurrentUserData, @Param('orderId') orderId: string) {
    return this.orderService.getOrderById(user.id, orderId);
  }
}
