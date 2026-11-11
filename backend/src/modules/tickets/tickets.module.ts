import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventTicketType } from './entities/event-ticket-type.entity.js';
import { Promocode } from './entities/promocode.entity.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { ETicket } from './entities/e-ticket.entity.js';
import { RefundRequest } from './entities/refund-request.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventTicketType, Promocode, Order, OrderItem, ETicket, RefundRequest
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TicketsModule {}