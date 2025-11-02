import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../database/entities/cart.entity';
import { CartItem } from '../../database/entities/cart-item.entity';
import { User } from '../../database/entities/user.entity';
import { CartStatus } from '../../common/enums/cart-status.enum';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get or create active cart for user
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    // Ensure user exists (create if mock user)
    let user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      user = this.userRepository.create({
        id: userId,
        email: 'demo@example.com',
        displayName: 'Demo User',
      });
      await this.userRepository.save(user);
    }

    // Find active cart with ordered items
    let cart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoin('cart.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('cart.status = :status', { status: CartStatus.ACTIVE })
      .orderBy('items.createdAt', 'ASC')
      .getOne();

    // Create new cart if none exists
    if (!cart) {
      cart = this.cartRepository.create({
        user,
        status: CartStatus.ACTIVE,
        items: [],
        subtotal: '0.00',
        total: '0.00',
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException('Cannot modify a checked out or abandoned cart');
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find((item) => item.productId === dto.productId);

    if (existingItem) {
      // Update quantity
      existingItem.quantity += dto.quantity;
      existingItem.subtotal = this.calculateSubtotal(existingItem.unitPrice, existingItem.quantity);
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      const subtotal = this.calculateSubtotal(dto.unitPrice, dto.quantity);
      const cartItem = this.cartItemRepository.create({
        cart,
        productId: dto.productId,
        name: dto.name,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        subtotal,
        currency: dto.currency,
        metadata: dto.metadata ?? null,
      });
      await this.cartItemRepository.save(cartItem);
      cart.items.push(cartItem);
    }

    // Recalculate cart totals
    await this.recalculateCartTotals(cart);

    const result = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.id = :id', { id: cart.id })
      .orderBy('items.createdAt', 'ASC')
      .getOne();

    if (!result) {
      throw new InternalServerErrorException('Failed to retrieve cart after adding item');
    }

    return result;
  }

  /**
   * Update cart item quantity
   */
  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException('Cannot modify a checked out or abandoned cart');
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = dto.quantity;
    item.subtotal = this.calculateSubtotal(item.unitPrice, item.quantity);
    await this.cartItemRepository.save(item);

    await this.recalculateCartTotals(cart);

    const result = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.id = :id', { id: cart.id })
      .orderBy('items.createdAt', 'ASC')
      .getOne();

    if (!result) {
      throw new InternalServerErrorException('Failed to retrieve cart after updating item');
    }

    return result;
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException('Cannot modify a checked out or abandoned cart');
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const deleteResult = await this.cartItemRepository.delete({ id: itemId });
    
    if (deleteResult.affected === 0) {
      throw new NotFoundException('Cart item not found or already deleted');
    }

    // Fetch fresh cart without the deleted item (ordered)
    const updatedCart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.id = :id', { id: cart.id })
      .orderBy('items.createdAt', 'ASC')
      .getOne();

    if (!updatedCart) {
      throw new InternalServerErrorException('Failed to retrieve cart after removing item');
    }

    // Recalculate totals based on remaining items
    await this.recalculateCartTotals(updatedCart);

    // Return fresh cart with updated totals (ordered)
    const result = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.id = :id', { id: cart.id })
      .orderBy('items.createdAt', 'ASC')
      .getOne();

    if (!result) {
      throw new InternalServerErrorException('Failed to retrieve cart after removing item');
    }

    return result;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException('Cannot modify a checked out or abandoned cart');
    }

    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
      cart.items = [];
    }

    cart.subtotal = '0.00';
    cart.total = '0.00';
    await this.cartRepository.save(cart);

    return cart;
  }

  /**
   * Get active cart for user
   */
  async getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  /**
   * Calculate subtotal for an item
   */
  private calculateSubtotal(unitPrice: string, quantity: number): string {
    const price = parseFloat(unitPrice);
    if (isNaN(price)) {
      throw new InternalServerErrorException('Invalid unit price');
    }
    return (price * quantity).toFixed(2);
  }

  /**
   * Recalculate cart totals based on items
   */
  private async recalculateCartTotals(cart: Cart): Promise<void> {
    let subtotal = 0;

    for (const item of cart.items) {
      const itemSubtotal = parseFloat(item.subtotal);
      if (isNaN(itemSubtotal)) {
        throw new InternalServerErrorException('Invalid item subtotal');
      }
      subtotal += itemSubtotal;
    }

    cart.subtotal = subtotal.toFixed(2);
    cart.total = subtotal.toFixed(2); // In future, add taxes, discounts, shipping

    await this.cartRepository.save(cart);
  }
}
