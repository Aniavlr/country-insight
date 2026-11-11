import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Event } from './event.entity.js';

@Entity('event_images')
export class EventImage extends BaseEntity {
  @Column()
  url: string;

  @Column({ default: 0 })
  sortOrder: number; // порядок сортировки

  @ManyToOne('Event', (event: Event) => event.images, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Relation<Event>;
}