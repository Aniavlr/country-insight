import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('organizer_types')
export class OrganizerType extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'Компания', 'Ресторан', 'Частное лицо'
}
