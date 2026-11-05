import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('notification_types')
export class NotificationType extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'Новое событие', 'Отмена', 'Билет', 'Напоминание', 'Возврат'
}
