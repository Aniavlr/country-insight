import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('e_ticket_statuses')
export class ETicketStatus extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'Активен', 'Ожидает оплаты', 'Использован', 'Отменён'
}