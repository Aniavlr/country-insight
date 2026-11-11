import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Event } from '../../events/entities/event.entity.js';
import { TicketType } from '../../dictionaries/entities/ticket-type.entity.js';

@Entity('event_ticket_types')
export class EventTicketType extends BaseEntity {
  @Column()
  name: string; // Standard, VIP

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 0 })
  totalQuantity: number; // Общее количество

  @Column({ type: 'timestamp', nullable: true })
  salesStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  salesEndDate: Date;

  @Column({ default: 0 })
  limitPerUser: number; // 0 - без лимита

  @Column({ nullable: true })
  refundPolicy: string; // "разрешён", "запрещён", "срок"

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => TicketType)
  @JoinColumn()
  paymentType: TicketType; // Бесплатное, Платное, Donation, По брони
}