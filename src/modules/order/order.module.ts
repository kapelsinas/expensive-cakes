import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../database/entities/order.entity';
import { Cart } from '../../database/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

