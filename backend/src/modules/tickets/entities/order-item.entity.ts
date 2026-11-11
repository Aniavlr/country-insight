import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Order } from './order.entity.js';
import { EventTicketType } from './event-ticket-type.entity.js';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerUnit: number; // Фиксируем цену на момент покупки

  @ManyToOne('Order', (order: Order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Relation<Order>;

  @ManyToOne(() => EventTicketType)
  @JoinColumn()
  ticketType: EventTicketType;
}