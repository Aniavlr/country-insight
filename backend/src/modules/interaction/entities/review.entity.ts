import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Event } from '../../events/entities/event.entity.js';
import { ReviewPhoto } from './review-photo.entity.js';

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  text: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @OneToMany(() => ReviewPhoto, (photo) => photo.review)
  photos: ReviewPhoto[];
}