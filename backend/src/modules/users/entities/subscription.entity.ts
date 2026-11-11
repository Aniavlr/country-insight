import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { User } from './user.entity.js';
import { Organizer } from './organizer.entity.js';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Organizer, { onDelete: 'CASCADE' })
  @JoinColumn()
  organizer: Organizer;
}
