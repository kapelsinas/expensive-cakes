import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Checkout active cart and create order
   */
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkout(@CurrentUser() user: CurrentUserData, @Body() dto: CheckoutDto) {
    return this.orderService.checkout(user.id, dto);
  }

  /**
   * Get all orders for current user
   */
  @Get()
  async getOrders(@CurrentUser() user: CurrentUserData) {
    return this.orderService.getOrders(user.id);
  }

  /**
   * Get specific order by ID
   */
  @Get(':orderId')
  async getOrderById(
    @CurrentUser() user: CurrentUserData,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.getOrderById(user.id, orderId);
  }
}

