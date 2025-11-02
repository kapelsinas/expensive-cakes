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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get active cart',
    description: 'Retrieve or create active cart for current user',
  })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Add a product to cart. If item exists, quantity will be increased.',
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 200, description: 'Item added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid cart state or validation error' })
  async addItem(@CurrentUser() user: CurrentUserData, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Update quantity of existing cart item',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItem(
    @CurrentUser() user: CurrentUserData,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item', description: 'Remove specific item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(@CurrentUser() user: CurrentUserData, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart', description: 'Remove all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.clearCart(user.id);
  }
}
