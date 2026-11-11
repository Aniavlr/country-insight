import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { OrderItem } from './order-item.entity.js';
import { ETicketStatus } from '../../dictionaries/entities/e-ticket-status.entity.js';
import { Organizer } from '../../users/entities/organizer.entity.js';

@Entity('e_tickets')
export class ETicket extends BaseEntity {
  @Column({ unique: true })
  code: string; // CI-2025-A7K3-9X2M

  @Column({ nullable: true })
  barcodeUrl: string; 

  @Column()
  holderName: string; // Имя владельца

  @Column()
  holderEmail: string; // Email владельца

  @Column({ default: false })
  isManuallyAdded: boolean; // Добавлен вручную организатором?

  @Column({ default: false })
  isUsed: boolean; // Отметка "пришёл"

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date; // Время отметки

  @ManyToOne('OrderItem', { onDelete: 'CASCADE' })
  @JoinColumn()
  orderItem: Relation<OrderItem>;

  @ManyToOne(() => ETicketStatus)
  @JoinColumn()
  status: ETicketStatus;

  @ManyToOne('Organizer', { nullable: true })
  @JoinColumn()
  markedBy: Relation<Organizer>; // Кто отметил "пришёл"
}