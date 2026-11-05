import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('order_statuses')
export class OrderStatus extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'Ожидает оплаты', 'Оплачен', 'Отменён', 'Возврат'
}
