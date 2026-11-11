import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Event } from '../../events/entities/event.entity.js';
import { Review } from './review.entity.js';

@Entity('complaints')
export class Complaint extends BaseEntity {
  @Column({ type: 'text' })
  reason: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'resolved', 'rejected'

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User; // Кто пожаловался

  // Полиморфная связь: либо на событие, либо на отзыв
  @ManyToOne(() => Event, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => Review, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  review: Review;
}