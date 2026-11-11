import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Event } from '../../events/entities/event.entity.js';
import { ReminderType } from '../../dictionaries/entities/reminder-type.entity.js';

@Entity('reminders')
export class Reminder extends BaseEntity {
  @Column({ type: 'timestamp' })
  remindAt: Date; // Когда нужно отправить

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date; // Когда фактически отправили

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => ReminderType)
  @JoinColumn()
  type: ReminderType;
}