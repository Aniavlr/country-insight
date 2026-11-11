import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Event } from './event.entity.js';

@Entity('event_locations')
export class EventLocation extends BaseEntity {
  @Column()
  address: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  lat: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  lon: number;

  @Column({ nullable: true })
  note: string; // уточнение ("вход со двора")

  @ManyToOne('Event', (event: Event) => event.locations, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Relation<Event>;
}