import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('badges')
export class Badge extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  condition: string; // Условие получения
}