import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('event_statuses')
export class EventStatus extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'На модерации', 'Одобрено', 'Отклонено', 'Отменено'
}
