import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { City } from '../../dictionaries/entities/city.entity.js';
import { Category } from '../../dictionaries/entities/category.entity.js';
import { Format } from '../../dictionaries/entities/format.entity.js';
import { AgeLimit } from '../../dictionaries/entities/age-limit.entity.js';
import { EventStatus } from '../../dictionaries/entities/event-status.entity.js';

import type { Organizer } from '../../users/entities/organizer.entity.js';
import type { EventImage } from './event-image.entity.js';
import type { EventLocation } from './event-location.entity.js';
import type { EventTicketType } from '../../tickets/entities/event-ticket-type.entity.js';

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
  isRecurring: boolean;

  @Column({ type: 'text', nullable: true })
  includedInPrice: string;

  @Column({ nullable: true })
  dressCode: string;

  @Column({ type: 'text', nullable: true })
  bringWithYou: string;

  // Связи со справочниками:
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

  // Двусторонние связи:
  @ManyToOne('Organizer')
  @JoinColumn()
  organizer: Relation<Organizer>;

  @OneToMany('EventImage', (image: EventImage) => image.event)
  images: Relation<EventImage[]>;

  @OneToMany('EventLocation', (location: EventLocation) => location.event)
  locations: Relation<EventLocation[]>;

  @OneToMany(
    'EventTicketType',
    (ticketType: EventTicketType) => ticketType.event,
  )
  ticketTypes: Relation<EventTicketType[]>;
}
