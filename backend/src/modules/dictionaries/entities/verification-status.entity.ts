import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('verification_statuses')
export class VerificationStatus extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 'На проверке', 'Одобрен', 'Отклонён'
}
