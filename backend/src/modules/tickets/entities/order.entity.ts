import { Entity, Column, ManyToOne, JoinColumn, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Organizer } from '../../users/entities/organizer.entity.js';
import { Event } from '../../events/entities/event.entity.js';
import { OrderStatus } from '../../dictionaries/entities/order-status.entity.js';
import { Promocode } from './promocode.entity.js';
import { OrderItem } from './order-item.entity.js';

@Entity('orders')
export class Order extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // Когда оплачен

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => OrderStatus)
  @JoinColumn()
  status: OrderStatus;

  @ManyToOne(() => Promocode, { nullable: true })
  @JoinColumn()
  promocode: Promocode;

  @ManyToOne('Organizer', { nullable: true })
  @JoinColumn()
  paidMarkedBy: Relation<Organizer>; // Кто отметил оплату

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}