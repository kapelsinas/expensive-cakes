import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get active cart for current user
   */
  @Get()
  async getCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.getCart(user.id);
  }

  /**
   * Add item to cart
   */
  @Post('items')
  async addItem(@CurrentUser() user: CurrentUserData, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  /**
   * Update cart item quantity
   */
  @Patch('items/:itemId')
  async updateItem(
    @CurrentUser() user: CurrentUserData,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  /**
   * Remove item from cart
   */
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  async removeItem(@CurrentUser() user: CurrentUserData, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  /**
   * Clear entire cart
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.clearCart(user.id);
  }
}

