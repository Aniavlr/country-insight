import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('age_limits')
export class AgeLimit extends BaseEntity {
  @Column({ length: 10 })
  value: string; // '0+', '6+', '12+', '16+', '18+'
}
