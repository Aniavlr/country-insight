import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('formats')
export class Format extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  slug: string; // Например: 'уютно', 'шумно'
}
