import { Entity, Column, ManyToOne, JoinColumn, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Organizer } from '../../users/entities/organizer.entity.js';
import { City } from '../../dictionaries/entities/city.entity.js';
import { Category } from '../../dictionaries/entities/category.entity.js';
import { Format } from '../../dictionaries/entities/format.entity.js';
import { AgeLimit } from '../../dictionaries/entities/age-limit.entity.js';
import { EventStatus } from '../../dictionaries/entities/event-status.entity.js';
import { EventImage } from './event-image.entity.js';
import { EventLocation } from './event-location.entity.js';

@Entity('events')
export class Event extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: false })
  isRecurring: boolean; // разовое или повторяющееся

  @Column({ type: 'text', nullable: true })
  includedInPrice: string; // что входит в стоимость

  @Column({ nullable: true })
  dressCode: string;

  @Column({ type: 'text', nullable: true })
  bringWithYou: string; // что взять с собой

  // Связи:
  @ManyToOne('Organizer')
  @JoinColumn()
  organizer: Relation<Organizer>;

  @ManyToOne(() => City)
  @JoinColumn()
  city: City;

  @ManyToOne(() => Category)
  @JoinColumn()
  category: Category;

  @ManyToOne(() => Format, { nullable: true })
  @JoinColumn()
  format: Format;

  @ManyToOne(() => AgeLimit, { nullable: true })
  @JoinColumn()
  ageLimit: AgeLimit;

  @ManyToOne(() => EventStatus)
  @JoinColumn()
  status: EventStatus;

  @OneToMany(() => EventImage, (image) => image.event)
  images: EventImage[];

  @OneToMany(() => EventLocation, (location) => location.event)
  locations: EventLocation[];
}