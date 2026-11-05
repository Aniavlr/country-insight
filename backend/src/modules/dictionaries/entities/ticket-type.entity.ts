import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('ticket_types')
export class TicketType extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'Бесплатное', 'Платное', 'Donation', 'По брони'
}
