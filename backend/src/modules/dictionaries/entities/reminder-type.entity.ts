import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('reminder_types')
export class ReminderType extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'За 24 часа', 'За 1 час'
}
