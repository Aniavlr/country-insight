import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Review } from './review.entity.js';

@Entity('review_photos')
export class ReviewPhoto extends BaseEntity {
  @Column()
  url: string;

  @ManyToOne('Review', (review: Review) => review.photos, { onDelete: 'CASCADE' })
  @JoinColumn()
  review: Relation<Review>;
}