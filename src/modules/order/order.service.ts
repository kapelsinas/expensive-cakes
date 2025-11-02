import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItemSnapshot } from '../../database/entities/order.entity';
import { Cart } from '../../database/entities/cart.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { CartStatus } from '../../common/enums/cart-status.enum';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Checkout cart and create order (transactional)
   */
  async checkout(userId: string, dto: CheckoutDto): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      // Find active cart with items
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId }, status: CartStatus.ACTIVE },
        relations: ['items', 'user'],
      });

      if (!cart) {
        throw new NotFoundException('No active cart found');
      }

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cannot checkout an empty cart');
      }

      // Create items snapshot for order
      const itemsSnapshot: OrderItemSnapshot[] = cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        currency: item.currency,
      }));

      // Create order
      const order = manager.create(Order, {
        user: cart.user,
        cart,
        status: OrderStatus.AWAITING_PAYMENT,
        preferredPaymentProvider: dto.preferredPaymentProvider ?? null,
        totalAmount: cart.total,
        subtotal: cart.subtotal,
        currency: cart.currency,
        itemsSnapshot,
        payments: [],
      });

      await manager.save(Order, order);

      // Mark cart as checked out
      cart.status = CartStatus.CHECKED_OUT;
      await manager.save(Cart, cart);

      return order;
    });
  }

  /**
   * Get all orders for a user
   */
  async getOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['payments'],
    });
  }

  /**
   * Get specific order by ID
   */
  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['payments', 'cart'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Update order status (used by payment module)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}

