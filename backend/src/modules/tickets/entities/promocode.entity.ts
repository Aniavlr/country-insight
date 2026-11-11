import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Event } from '../../events/entities/event.entity.js';

@Entity('promocodes')
export class Promocode extends BaseEntity {
  @Column()
  code: string;

  @Column()
  discountType: string; // 'percent' или 'fixed'

  @Column('decimal', { precision: 10, scale: 2 })
  discountValue: number;

  @Column({ default: 0 })
  usageLimit: number; // 0 - без лимита

  @Column({ default: 0 })
  usedCount: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;
}